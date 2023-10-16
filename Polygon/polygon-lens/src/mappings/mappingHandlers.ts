import {
  PostCreatedLog,
  ProfileCreatedLog,
  FollowedLog,
} from "../types/abi-interfaces/LensHubAbi";
import { Account, Post, Profile, Follow } from "../types";
import assert from "assert";
import { BigNumber } from "ethers";

export async function getOrCreateAccount(
  accountAddress: string
): Promise<Account> {
  let account = await Account.get(accountAddress);
  if (account == null) {
    account = Account.create({
      id: accountAddress,
    });
  }
  return account;
}

export async function getOrCreateFollow(
  accountAddress: string
): Promise<Follow> {
  let follow = await Follow.get(accountAddress);
  if (follow == null) {
    follow = Follow.create({ id: accountAddress });
  }
  return follow;
}

export function getNewPublicactionId(profileId: BigInt, pubId: BigInt): string {
  return profileId.toString().concat("-").concat(pubId.toString());
}

export async function getOrCreatePost(pubId: BigInt): Promise<Post> {
  let post = await Post.get(pubId.toString());
  if (!post) {
    post = await Post.create({
      id: pubId.toString(),
    });
  }
  return post;
}

export async function getOrCreateProfile(profileId: string): Promise<Profile> {
  let profile = await Profile.get(profileId);
  if (profile === undefined) {
    profile = Profile.create({
      id: profileId,
    });
  }
  return profile;
}

export async function handleProfileCreated(
  event: ProfileCreatedLog
): Promise<void> {
  logger.warn("Handling ProfileCreatedLog");
  assert(event.args, "No log args");
  logger.warn(event.args.profileId.toString());

  let profile = await getOrCreateProfile(event.args.profileId.toString());
  let creator = await getOrCreateAccount(event.args.creator);
  let to = await getOrCreateAccount(event.args.to);
  profile.creatorId = creator.id;
  profile.ownerId = (await getOrCreateAccount(event.args.to)).id;
  profile.followNFTURI = event.args.followNFTURI;
  profile.handle = event.args.handle;
  profile.imageURI = event.args.imageURI;
  creator.save();
  to.save();
  profile.save();
}

export async function handlePostCreated(event: PostCreatedLog): Promise<void> {
  logger.warn("Handling PostCreatedLog");
  assert(event.args, "No log args");
  let post = await getOrCreatePost(event.args.pubId.toBigInt());
  let profile = await getOrCreateProfile(event.args.profileId.toString());
  post.profileId = profile.id;
  post.timestamp = event.args.timestamp.toBigInt();
  post.contentURI = event.args.contentURI;
  profile.save();
  post.save();
}

export async function handleFollowed(event: FollowedLog): Promise<void> {
  logger.warn("Handling FollowedLog");
  assert(event.args, "No log args");
  for (let index in event.args.profileIds) {
    let profileId = event.args.profileIds[index];
    logger.warn(profileId.toString());
    let profile = await getOrCreateProfile(profileId.toString());
    let follow = await getOrCreateFollow(
      event.args.follower
        .concat("-")
        .concat(event.transaction.hash)
        .concat("-")
        .concat(profileId.toString())
    );
    let follower = await getOrCreateAccount(event.args.follower);
    follow.fromAccountId = follower.id;
    follow.toProfileId = profile.id;
    follow.timestamp = event.args.timestamp.toBigInt();
    profile.save();
    follow.save();
    follower.save();
  }
}
