# Rebels Smart Contracts

## Build and Test

* Add `.env` file at the root of the project (use env.template as an example)
* `npm install`
* `npx hardhat compile`
* `npx hardhat test`

## Structure

* `contracts/`
  * `NightCard.sol`, first contract, used to mint initial NFTs and later
    convert them to revealed Rebels NFTs. Uses a delegated minting module to
    authorize mints, and calls into the `Rebels.sol` to reveal NFTs. Also takes
    payments and allows withdrawal (in `NFTBase.sol`).
  * `Rebels.sol`, second contract, allows minting when called from the first
    contract only. Also stores a provenance hash for fairness verification.
  * `NFTBase.sol`, base smart contract implementation. Uses openzeppelin's
    ERC721 implementation. Provides `tokenURI()` function by using a delegated
    rendering module.
  * `mint/`
    * `IRebelsMintAuthorizer.sol`, used by `NightCard.sol` to authorize each
      mint.
    * `IRebelsMintInfo.sol`, used by minting web UI to display information
      about the ongoing sale to the user.
    * `DutchMintAuthorizer.sol`, standard dutch auction authorizer. Linear
      decrease, no user access checking.
    * `MerkleMintAuthorizer.sol`, classic whitelist implementation with merkle
      tree hash checking.
    * `MultiMintAuthorizer.sol`, stores multiple merkle roots with their
      respective mint limits and prices. Minting users are matched to the
      specific `MintInfo` they are a member of.
  * `render/`
    * `IRebelsRenderer.sol`, interface for rendering module; used by
      `NFTBase.sol`.
    * `BaseURIRenderer.sol`, basic token metadata reference.
* `test/`, smart contracts unit tests
* `tasks/`, hardhat tasks used for deployment, administration, etc.
* `env.template`, contains an example of `.env` file, with all the necessary environment variables to build and deploy the project

## Environment variables
* `ETHERSCAN_API_KEY` is optional and should contain your [Etherscan](https://etherscan.io/) API key.

## Bug Bounty Program

We want Rebels to adhere to the highest quality and security standards in our
industry. This is why we're releasing our smart contract source code ahead of
the mint and we're announcing our Bug Bounty Program!

Please reach out with any finding at: security@rebels.art. Reports should
include: severity, impact, proposed mitigation, and if possible a POC.

Bug bounty rewards will match Immunefi market standards.
