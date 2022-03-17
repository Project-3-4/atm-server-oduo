-- reset database
DROP TABLE IF EXISTS internalTransactions;
DROP TABLE IF EXISTS externalTransactions;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
	userId VARCHAR(18) not NULL,
    pin VARCHAR(4) not NULL, -- encrypted?
    email VARCHAR(45) not NULL,
    birthDay DATE not NULL,
    firstName VARCHAR(45) not NULL,
    middleName VARCHAR(45) DEFAULT NULL,
    lastName VARCHAR(45) not NULL,
    incorrectAttempts TINYINT, -- 0-255
    PRIMARY KEY (userId)
);

CREATE TABLE externalUserLog (
	TransId INT not NULL AUTO_INCREMENT,
    userId VARCHAR(18) not NULL,
    withdrawnAmmount FLOAT not NULL,
    balanceCheck BIT not NULL,
    PRIMARY KEY (TransId),
    FOREIGN KEY (userId) REFERENCES users (userId)
);

CREATE TABLE internalUserLog (
	TransId INT not NULL AUTO_INCREMENT,
    userId VARCHAR(18) not NULL,
    withdrawnAmmount FLOAT not NULL,
    balanceCheck BIT not NULL,
    depositAmmount INT not NULL,
    PRIMARY KEY (TransId),
    FOREIGN KEY (userId) REFERENCES users (userId)
);

 