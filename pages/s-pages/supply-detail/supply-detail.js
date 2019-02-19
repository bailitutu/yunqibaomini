// pages/s-pages/supply-detail/supply-detail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    currTab:'tab1',
    showShopCar:false,
    shopInfo:{},
    shopId:'',
    imgBaseUrl:null,
    shopGoods:[],
    shopCarList:[],
    orderType:1,
    // dispatching:'0.00',
    allPrice:'0.00',
    hasSelectGoods:false,
    shopDetail:{},

  },
  onLoad:function(options){
    
    this.setData({
      shopId:options.id,
      imgBaseUrl:app.configUrl.baseUrl
    })
    this.getShopDetail(options.id)
  },
  // 获取店铺信息
  getShopInfo(shopId){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doSupplyDetailTwo',
          data: {
            openId: openId,
            supplyId: shopId,
            recId: app.globalData.recId,
          }
        }, function (res) {
          if (!res.goods.length) {
            wx.showModal({
              title: '提示',
              content: '暂无商品',
            })            
          } else {
            res.goods.map(function (item) {
              item.shopNum = 0
            })
          }
          that.setData({
            shopInfo: res,
            shopGoods: res.goods,
            isReady: true
          })
          wx.hideLoading();
        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  
  // 切换
  tabClick(e){
    const { id } = e.currentTarget.dataset
    this.setData({
      currTab: id
    })
  },
  // 显隐购物车
  showScar(){
    this.showShopCar = !this.showShopCar ;
    this.setData({
      showShopCar: this.showShopCar
    })
  },
  // 查看商户资质
  checkShopQual(){
    wx.navigateTo({
      url: '../supply-qual/supply-qual?id='+ this.data.shopId,
    })

  },
  // 选择订单类型
  selectOrderType(e){
    const {id} = e.currentTarget.dataset;
    this.setData({
      orderType:id
    })
  },

  // 添加购买商品时，减数量
  noAddShopNum(e){
    let {index,num} = e.currentTarget.dataset;
    num--;

    if(num<0){
      num = 0;
      return false;
    }
    var shopNum = 'shopGoods['+index+'].shopNum';
    this.setData({
        [shopNum]: num,
        hasSelectGoods:false
    })

    this.getAllPrice();

  },

  // 添加购买商品时，加数量
  addShopNum(e){
    if (this.data.hasSelectGoods){
      wx.showToast({
        title: '每次只能购买一个商品',
        icon:'none'
      })
        return false;
    }
    let { index, num } = e.currentTarget.dataset;
    num++;
    if(num>1){
      num = 1
      return false;
    }
    var shopNum = 'shopGoods[' + index + '].shopNum';
    this.setData({
      [shopNum]: num,
      hasSelectGoods:true
    })
    this.getAllPrice();

  },
  // 获取价格
  getAllPrice(){
    var allPrice = 0,dispatching = 0;
    var shopList = this.data.shopGoods;
    var hasGoods = false;
    shopList.map(function(item){
      if(item.shopNum > 0){
        hasGoods = true;
        allPrice += Number(item.price);
        // dispatching += Number(item.dispatching);
      }
    })
    if(!hasGoods){
      allPrice = '0.00';
      // dispatching = '0.00'
    }else{
      allPrice = allPrice.toFixed(2);
      // dispatching = dispatching.toFixed(2);
    }
    this.setData({
      allPrice: allPrice,
      // dispatching: dispatching
    })

  },
  // 获取商铺详情
  getShopDetail(id){
    var that = this;
    wx.showLoading();
    app.requestFn({
      url: '/proapi/doEnSupplyDetail',
      data: {
        supplyId: id
      }
    }, function (res) {
      that.setData({
        shopDetail: res
      })
      that.getShopInfo(id);


    }, function (err) {
      console.log(err);
      wx.hideLoading();
    })

  },
  // 确认下单
  confirmPlace(){
    var goodsList = this.data.shopGoods;
    var goodAttr = '';
    var goodsNum = 0;
    var goodBrand = '';

    if (this.data.shopInfo.status== "休息中"){
      wx.showModal({
        title: '提示',
        content: '供应点休业中，无法下单',
      })
      return false;
    }

    goodsList.map(function(item){
      if(item.shopNum > 0){
        goodAttr = item.specifications,
        goodsNum = item.shopNum,
          goodBrand = item.brand
      }        
    })

    if (goodBrand == "" || !goodBrand){
      wx.showModal({
        title: '提示',
        content: '请先选择商品',
      })
      return false;
    }
    wx.navigateTo({
      url: '/pages/o-pages/confirm-order/confirm-order?goodAttr=' + goodAttr + '&orderType=' + this.data.orderType + '&supplyId=' + this.data.shopId + '&goodBrand=' + goodBrand 
    })

  },
  // 拨打电话
  callPhone(e){
    const { phone } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone,
    })


  }


  
})