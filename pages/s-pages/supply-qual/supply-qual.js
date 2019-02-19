// pages/s-pages/supply-qual/supply-qual.js
var app = getApp();
Page({
  data: {
    isReady:false,
    shopInfo:{},
    infoList:[],
    imgInfo:{}
  },
  onLoad: function (options) {
    if(options.id){
      this.getShopInfo(options.id);
    }
  },

  getShopInfo(id){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.requestFn({
      url: '/proapi/doEnsupplyCertificates',
      data: {
        supplyId: id
      }
    }, function (res) {

      var infoList = [
        {
          title:'管理人姓名 ',
          value: res.supplyPeople
        },{
          title:'配送范围',
          value:res.city +' '+ res.region
        }
      ];

      var imgInfo = {
        title:"运营执照",
        imgList:[
          {
            imgUrl: app.configUrl.baseUrl + res.licenseA
          },{
            imgUrl: app.configUrl.baseUrl + res.licenseB
          }
        ]
      }
      that.setData({
        infoList: infoList,
        imgInfo: imgInfo,
        isReady:true
      })
      wx.hideLoading();
    })

  }
})