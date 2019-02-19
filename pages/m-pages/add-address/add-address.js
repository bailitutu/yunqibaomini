var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    isfrom:false, //是否从首页跳转而来
    userName: '',
    userPhone: '',
    userDetail: '',
    region: '请选择',
    hasSelect: false,
    btnText: "保存收货地址"
  },
  onLoad(options) {
      if(options.isFrom){
        this.setData({
          isfrom:true
        })
      }
  },
  onShow(){
    this.setData({
      isReady:true
    })
  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value,
      hasSelect: true
    })
  },

  changeName(e) {
    this.setData({
      userName: e.detail.value
    })
  },
  changePhone(e) {
    this.setData({
      userPhone: e.detail.value
    })
  },
  changeDetail(e) {
    this.setData({
      userDetail: e.detail.value
    })
  },
  saveAddress() {
    const { userName, userPhone, userDetail, region, hasSelect } = this.data
    var that = this;
    if (userName.length <= 0 || !userName) {
      wx.showModal({
        title: '警告',
        content: '请输入收货人姓名',
      })
      return false;
    } else if (userPhone.length <= 0 || !userName) {
      wx.showModal({
        title: '警告',
        content: '请输入收货人电话号码',
      })
      return false;
    } else if (!hasSelect) {
      wx.showModal({
        title: '警告',
        content: '请选择所在省市区',
      })
      return false;
    } else if (userDetail.length <= 0 || !userDetail) {
      wx.showModal({
        title: '警告',
        content: '请填写详细地址',
      })
      return false;
    } else {
      wx.showLoading({
        title: "提交中...",
        mask: true
      })
      app.getUserOpenId(function (err, openId) {
        if (!err) {
          const postData = {
            openId: openId,
            regname: userName,
            regphone: userPhone,
            province: region[0],
            city: region[1],
            region: region[2],
            address: userDetail
          }
       
          app.requestFn({
            url: '/proapi/doEditReceiving',
            data: postData
          }, function (res) {
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: '添加成功',
              showCancel:false,
              success:function(){
                if (that.data.isfrom) {
                  wx.switchTab({
                    url: '/pages/index/index',
                  })
                } else {
                  wx.navigateBack();
                }
              }
            })
          })
        } else {
          console.log(err);
          wx.hideLoading();
        }
      })

     


    }

  }
})