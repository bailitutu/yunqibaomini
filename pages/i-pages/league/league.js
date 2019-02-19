var app = getApp();
Page({
  data: {
    imgBase:'',
    scene_img1:'',
    scene_img2:''
  },
  onLoad: function (options) {
    this.setData({
      imgBase: app.configUrl.baseUrl
    })
    this.getPageData();
  },
  getPageData(){
    var that = this
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.requestFn({
      url: '/proapi/doAppCode'
    }, function (res) {
      that.setData({
        scene_img1: that.data.imgBase + res.androidCode,
        scene_img2: that.data.imgBase + res.iosCode
      })
      wx.hideLoading();
    });

  },
  previewImage: function (e) {
    const { type } = e.currentTarget.dataset;
  
    let imgUrl = type == 1 ? this.data.scene_img1 : this.data.scene_img2

    wx.previewImage({
      urls: imgUrl.split(',')
      // 需要预览的图片http链接  使用split把字符串转数组。不然会报错  
    })
  },

})