'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CampaignSchema = new Schema({
  campaignNo: String,
  cartName: String,
  checkoutParameters: Object,
  skuArray: Array,
  totalWeight: String,
  taxRate: String,
  tax: String,
  campaignName: String,
  objective: String,
  startDate:{type: Date},
  endDate:{type: Date},
  products: String,
  totalSpend: String,
  spendStats: String,
  shipping: Object,
  age: Array,
  uid: String,
  income: Array,
  active: { type: Boolean, default: true },
  updated: {type: Date},
  campaignDate: {type: Date, default: Date.now},
  status: Object({ name: String, val: Number}),
  items: [{ sku: String, name: String, size: String, quantity: String, mrp: String, price: String, image: String, category: String,advertiser: Object ,publisher:String,uid:String,status: Object({ name: String, val: Number}) ,creative:Object,request: [{startDate: {type: Date},endDate: {type: Date},dueDate:  {type: Date},budget:String,objective: String,contactName:String ,contactEmail:String}],messages:[{id: String,text: String,avatar: String, date: {type:Date}}]}]
  }, { versionKey: false });

module.exports = mongoose.model('Campaign', CampaignSchema);
