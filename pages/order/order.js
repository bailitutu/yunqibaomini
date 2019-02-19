// pages/order/order.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isScroll:true,
    isReady:false,
    showCancel2:false,
    orderList:[],
    imgBaseUrl:null,
    showCancel:false,
    cancelOrderId:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgBaseUrl: app.configUrl.baseUrl
    })
  },
  onShow:function(){
    this.getOrderList();
  },
  // 获取所有订单
  getOrderList(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err ) {
        app.requestFn({
          url: '/proapi/doAllOrder',
          data: {
            openId: openId
          }
        }, function (res) {

          if(res.orderList){
            res.orderList.map(function(item){
              switch (item.orderStatus){
                case 1:
                  item.status = '待发货'
                break;
                case 2:
                  item.status = '配送中'
                  break;
                case 3:
                  item.status = '待评价'
                  break;
                case 5:
                  item.status = '已完成'
                  break;
                case 7:
                  item.status = '待接单'
                  break;
                default:
                  return false;
              }

              item.goodsList.map(function(cell){
                if (cell.specifications === '50kg') {
                  cell.specName = 'YSP-50型'
                } else if (cell.specifications === '15kg') {
                  cell.specName = 'YSP-15型'
                } else if (cell.specifications === '5kg') {
                  cell.specName = 'YSP-5型'
                }

              })

            })
          }
          that.setData({
            orderList: res.orderList,
            isReady:true
          })
          wx.hideLoading();
        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })


  },
  // 查看订单详情
  checkOrder(e){

    const {orderid} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../o-pages/orderDetail/orderDetail?orderId=' + orderid,
    })
  },

  // 取消订单按钮点击
  cancelOrderHander(e) {
    const {orderid,status} = e.currentTarget.dataset;
    if (status == '3' || status== '2'){
      this.setData({
        showCancel2: true,
        isScroll: false,
        cancelOrderId: orderid
      })
    }else{
      this.setData({
        showCancel: true,
        isScroll: false,
        cancelOrderId: orderid
      })
    }
  },


  // 取消订单操作
  confirmHander() {
    this.setData({
      showCancel: false,
      isScroll: true,
    })
    this.cancerOrderFn();
  },

  // 取消订单操作
  confirmHander2() {
    this.setData({
      showCancel2: false,
      isScroll: true,
    })
    this.cancerOrderFn();
  },

  //取消订单
  cancerOrderFn() {
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doCanOrder',
          data: {
            openId: openId,
            orderId: that.data.cancelOrderId
          }
        }, function (res) {
          that.getOrderList();
        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })
  },
  // 不取消订单
  cancelHander(){
    this.setData({
      showCancel: false,
      isScroll: true,
      cancelOrderId:null,
    })
  },
  // 不取消订单
  cancelHander2() {
    this.setData({
      showCancel2: false,
      isScroll: true,
      cancelOrderId: null,
    })
  },



  // 删除订单
  delOrderHander(e) {
    const {orderid} = e.currentTarget.dataset;
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除订单？',
      success: function (res) {
        if (res.confirm) {
          that.deleteOrder(orderid);
        } else {
          return false;
        }
      }
    })
  },

  // 产权置换
  changeHander(e){
    const { orderid } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/o-pages/equitySwap/equitySwap?orderId=' + orderid,
    })

  },

  // 删除订单函数
  deleteOrder(orderid) {
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.requestFn({
      url: '/proapi/doRemoveOrder',
      data: {
        orderId: orderid
      },
    }, function (res) {
      wx.hideLoading();
      that.getOrderList();
    })

  },

  // 点击服务评价
  serviceHander(e){
    const {orderid} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../o-pages/comment/comment?orderId=' + orderid,
    })
  }
})