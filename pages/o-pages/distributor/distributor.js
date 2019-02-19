// pages/o-pages/distributor/distributor.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    transitId:'',
    infoList: [],
    imgInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.transitId){
      this.getTransitInfo(options.transitId);
    }
  },
  // 获取配送员资质

  getTransitInfo(id) {
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.requestFn({
      url: '/proapi/selMarki',
      data: {
        markiId: id
      }
    }, function (res) {
      var infoList = [
        {
          title: '配送员姓名 ',
          value: res.markiName 
        }, {
          title: '所属站点',
          value: res.supplyName 
        }
      ];

      var imgInfo = {
        title: "工作证件",
        imgList: [
          {
            imgUrl: app.configUrl.baseUrl + res.employeeCard
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