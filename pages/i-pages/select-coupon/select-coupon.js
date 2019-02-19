
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    discountList:[],
    selectDiscountId:'',
    phone:'',
    specifications:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if (options.couponId){
        this.setData({
          selectDiscountId:options.couponId
        })
      }
      if (options.specifications){
        this.setData({
          specifications: options.specifications
        })
      }

      this.getCouponList();
  },

  getCouponList(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url:'/proapi/doTypeCoupons',
          data:{
            openId:openId,
            specifications: that.data.specifications
          }
        },function(res){
          if (res.couponList) {
            res.couponList.map(function (item) {
              if (item.specifications === '50kg') {
                item.discountName = 'YSP-50型'
              } else if (item.specifications === '15kg') {
                item.discountName = 'YSP-15型'
              } else if (item.specifications === '5kg') {
                item.discountName = 'YSP-5型'
              }
            })

            that.setData({
              discountList: res.couponList,
              phone: res.phone,
              isReady: true
            })
            wx.hideLoading();

          } else {

            that.setData({
              discountList: res.couponList,
              phone: res.phone,
              isReady: true
            })
            wx.hideLoading();
          }


        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })
  },
  // 选择优惠券
  selectCoupon(e) {
    const { id } = e.currentTarget.dataset;
    var couponName ;
    this.data.discountList.map(function(item){
        if(item.id == id){
          couponName = item.discountName + item.discount + '折优惠券'
        }
    })
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    this.setData({
      selectDiscountId: id,
    })
    prevPage.setData({
      couponId:id,
      couponName: couponName
    })
    wx.navigateBack();
  }
})