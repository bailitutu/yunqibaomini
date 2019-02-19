// pages/m-pages/address/address.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      isReady:false,
      addressList:[]

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onShow: function () {
    this.getAddressList();
  },
  getAddressList(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doEnReceivingList',
          data: {
            openId: openId
          }
        }, function (res) {
          that.setData({
            addressList: res.receicings,
            isReady:true
          });
          wx.hideLoading();

        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })

   
  },

  editAddress(e){
    const { addressid} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../change-address/change-address?regid=' + addressid,
    })
  },

  delAddress(e){
    var that = this;
    const { addressid } = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '删除后将不可恢复',
      success:function(res){
        if(res.confirm){

          app.getUserOpenId(function (err, openId) {
            if (!err) {
              app.requestFn({
                url: '/proapi/doDelReceiving',
                data: {
                  openId: openId,
                  regid: addressid
                }
              }, function (res) {

                that.getAddressList();

              }, function (error) {
                if (error.data.head.respCode === '0007021') {
                  wx.showModal({
                    title: '提示',
                    content: '默认地址不可删除',
                  })
                } else {
                  console.log(error);
                }
              })
            } else {
              console.log(err);
              wx.hideLoading();
            }
          })



   
        }else if(res.cancel){
          return false;
        }
      }
    })
  },
  // 新增地址
  newAddress(){
    wx.navigateTo({
      url: '../add-address/add-address',
    })
  }
})