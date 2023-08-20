#!/bin/bash

ROOT_PATH=$( dirname -- "$( readlink -f -- "$0"; )"; );
networkrpc_expression="^([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$"
networkname_expression="^[a-zA-Z0-9]{3,50}$"
networkid_expression="^[a-z\-0-9]{3,50}$"

echo -e "\033[0;33m ♨ Generating starter package  \033[0m\n"

check_eth_rpc() {
  NETWORK_ID="$((`curl -s $1 -X POST -H "Content-Type: application/json" --data '{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"}' | jq -r ".result"`))"

  TITLE=$(curl -s "https://chainlist.org/chain/$NETWORK_ID" | grep -oE "<title>.*</title>" | sed 's/<title>//' | sed 's/<\/title>//')
  NAME=($TITLE)
  NETWORK_NAME=$NAME
  NETWORK_LATESTBLOCK=$((`curl -s $1 -H "Content-Type: application/json" -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":83}' | jq -r ".result"`))
  NETWORK_START_SCAN_BLOCK=$NETWORK_LATESTBLOCK

  if [ "$NETWORK_ID" != "" ]; then
      return 0
  fi
  return 1
}

get_token_data() {
  NETWORK_ERC20_TOKEN=$1
  #Call Method name
  res=$(curl -s $input_networkrpc -H 'content-type: application/json'  --data-raw "{\"method\":\"eth_call\",\"params\":[{\"to\":\"${NETWORK_ERC20_TOKEN}\",\"data\":\"0x06fdde03\"},\"latest\"],\"id\":44,\"jsonrpc\":\"2.0\"}")
  NETWORK_ERC20_TOKEN_NAME=$(echo $res | jq ".result" |  xxd -r -p)

  if [ "$NETWORK_ERC20_TOKEN_NAME" != "" ]; then
      return 0
  fi
  return 1
}

read -p '  ✍ Enter netowrk RPC: ' input_networkrpc
while [ "$input_networkrpc" == "" ] || ! check_eth_rpc "$input_networkrpc"
do
  echo -e "\033[0;31m  ✘ Incorrect network RPC. Please check twice and send again. \033[0m \n"
  read -p '  ✍ Enter netowrk RPC: ' input_networkrpc
done

echo -e '\n\n   🔨 Generated Subquery params: '
echo -e "\033[0;32m       ✔️  Chain name: ${NETWORK_NAME^} \033[0m"
echo -e "\033[0;32m       ✔️  Chain id: ${NETWORK_ID} \033[0m"
echo -e "\033[0;32m       ✔️  Chain rpc: ${input_networkrpc} \033[0m"
echo -e "\033[0;32m       ✔️  Chain lastblock: ${NETWORK_LATESTBLOCK} \033[0m"

read -p '  ✍ Enter token address: ' input_tokenaddress
while [ "$input_tokenaddress" == "" ] || ! get_token_data "$input_tokenaddress"
do
  echo -e "\033[0;31m  ✘ Incorrect token address. Please check twice and send again. \033[0m \n"
  read -p '  ✍ Enter token address: ' input_tokenaddress
done
echo -e "\033[0;32m       ✔️  Chain erc20 token name: ${NETWORK_ERC20_TOKEN_NAME} \033[0m"

if [ -f "${ROOT_PATH}/${NETWORK_NAME^}" ]; then
    echo -e "\033[0;31m ✘ ${NETWORK_NAME^} starter Already exists. Code will be overwrite \033[0m\n"
    exit 0
fi

read -p "  🚧 Please type Y to continue " -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

echo -e "\033[0;32m    ⚡ Processing \033[0m"

mkdir -p $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter
cp -r $ROOT_PATH/_template/* $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter


sed -i "s/%NETWORK_ERC20_TOKEN%/${NETWORK_ERC20_TOKEN^}/g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/README.md
sed -i "s/%NETWORK_NAME%/${NETWORK_NAME^}/g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/README.md
sed -i "s/%NETWORK_NAME_LOWERCASE%/${NETWORK_NAME}/g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/package.json
sed -i "s/%NETWORK_NAME%/${NETWORK_NAME^}/g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/package.json
sed -i "s/%NETWORK_ID%/${NETWORK_ID}/g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/project.yaml
sed -i "s/%NETWORK_NAME_LOWERCASE%/${NETWORK_NAME}/g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/project.yaml
sed -i "s/%NETWORK_ERC20_TOKEN%/${NETWORK_ERC20_TOKEN}/g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/project.yaml
sed -i "s~%NETWORK_ENDPOINT_RPC_URL%~${input_networkrpc}~g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/project.yaml
sed -i "s/%NETWORK_STARTBLOCK%/${NETWORK_START_SCAN_BLOCK}/g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/project.yaml
sed -i "s/%NETWORK_DICTIONARY_URL%/https:\/\/gx\.api\.subquery\.network\/sq\/subquery\/${NETWORK_NAME}-dictionary/g" $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter/project.yaml


echo -e "\n\n  🎉 Congrats! Project ready\n"
echo -e "You can run your project with commands: \n "
echo -e "cd $ROOT_PATH/${NETWORK_NAME^}/${NETWORK_NAME}-starter && npm install && npm run dev"