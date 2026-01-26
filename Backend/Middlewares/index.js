const express = require('express');

function jsonParser() {
    return express.json({ limit: '50mb' });
}

module.exports = {
    jsonParser
};