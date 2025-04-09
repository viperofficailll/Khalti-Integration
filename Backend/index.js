import { config } from "dotenv";


const express = require("express");

const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const connectToMongo = require("./DBconn/Db.js");
connectToMongo();

app.listen(3001, () => {
  console.log("Backend listening at http://localhost:3001");
});

const { initializeKhaltiPayment, verifyKhaltiPayment } = require("./khalti");
const Payment = require("./paymentModel");
const PurchasedItem = require("./purchasedItemModel");
const Item = require("./itemModel");


// route to initilize khalti payment gateway
app.post("/initialize-khali", async (req, res) => {
  try {
    //try catch for error handling
    const { itemId, totalPrice, website_url } = req.body;
    const itemData = await Item.findOne({
      _id: itemId,
      price: Number(totalPrice),
    });

    if (!itemData) {
      return res.status(400).send({
        success: false,
        message: "item not found",
      });
    }
    // creating a purchase document to store purchase info
    const purchasedItemData = await PurchasedItem.create({
      item: itemId,
      paymentMethod: "khalti",
      totalPrice: totalPrice * 100,
    });

    const paymentInitate = await initializeKhaltiPayment({
      amount: totalPrice * 100, // amount should be in paisa (Rs * 100)
      purchase_order_id: purchasedItemData._id, // purchase_order_id because we need to verify it later
      purchase_order_name: itemData.name,
      return_url: `${process.env.BACKEND_URI}/complete-khalti-payment`, // it can be even managed from frontedn
      website_url,
    });

    res.json({
      success: true,
      purchasedItemData,
      payment: paymentInitate,
    });
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
});