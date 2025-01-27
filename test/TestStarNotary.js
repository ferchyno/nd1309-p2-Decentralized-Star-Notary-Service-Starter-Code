const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', 'AWS', tokenId, {from: accounts[0]})
    let star = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(star[0], 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', 'AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let tokenId = 10;
    let instance = await StarNotary.deployed();
    await instance.createStar('Five Stars Baby!', 'FSB', tokenId, {from: accounts[0]})

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let star = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(star[0], 'Five Stars Baby!');
    assert.equal(star[1], 'FSB');
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let tokenId1 = 6;
    let tokenId2 = 7;
    let instance = await StarNotary.deployed();
    await instance.createStar('Six Stars on the Wars', 'SSW', tokenId1, {from: accounts[1]});
    await instance.createStar('Seven Stars on the Class', 'SSC', tokenId2, {from: accounts[2]});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2, {from: accounts[1]});

    // 3. Verify that the owners changed
    let addressToken1 = await instance.getOwnerOf(tokenId1);
    let addressToken2 = await instance.getOwnerOf(tokenId2);
    assert.equal(addressToken1, accounts[2].toLowerCase());
    assert.equal(addressToken2, accounts[1].toLowerCase());
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let tokenId = 8;
    let instance = await StarNotary.deployed();
    await instance.createStar('The Eight Stars Richer to the teacher', 'ESRT', tokenId, {from: accounts[1]});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[2], tokenId, {from: accounts[1]});

    // 3. Verify the star owner changed.
    let addressToken = await instance.getOwnerOf(tokenId);
    assert.equal(addressToken, accounts[2].toLowerCase());
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let tokenId = 9;
    let instance = await StarNotary.deployed();
    await instance.createStar('Nine Stars to the NAS', 'NSN', tokenId, {from: accounts[1]});

    // 2. Call your method lookUptokenIdToStarInfo
    let info =  await instance.lookUptokenIdToStarInfo.call(tokenId);


    // 3. Verify if you Star name is the same
    assert.equal(info.substr(0, 43), 'Token: 9, Name: NSN - Nine Stars to the NAS');
});