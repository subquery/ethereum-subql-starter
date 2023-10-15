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
  if (post === undefined) {
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

  post.save();
}

export async function handleFollowed(event: FollowedLog): Promise<void> {
  logger.warn("Handling FollowedLog");
  let newFollows: string[] = [];
  assert(event.args, "No log args");
  newFollows = event.args.profileIds.map<string>(
    (profileId: BigNumber): string => profileId.toString()
  );

  for (let profile in newFollows) {
    let follow = await getOrCreateFollow(
      event.args.follower
        .concat("-")
        .concat(event.transaction.hash)
        .concat("-")
        .concat(profile)
    );
    let follower = await getOrCreateAccount(event.args.follower);
    follow.fromAccountId = follower.id;
    follow.toProfileId = profile;
    follow.timestamp = event.args.timestamp.toBigInt();
    follow.save();
    follower.save();
  }
}
