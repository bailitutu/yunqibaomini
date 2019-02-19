// pages/supply/supply.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    showFilter:false,
    supplyList:[],
    selectStatus:false,
    filterEnable:null,
    brandList:[],
    imgBaseUrl:null
  },

  // 进入供应点详情
  checkSupply(e){
    if (!app.globalData.validation) {
      wx.showModal({
        title: '提示',
        content: '您还没有实名认证哦~',
        confirmText: '立即实名',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/certification/certification',
            })
          }
        }
      })
      return false;
    }
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/s-pages/supply-detail/supply-detail?id=' + id
    })
  },

  // 展开筛选
  showfilter(){
    this.setData({
      showFilter: !this.data.showFilter,
      selectStatus: false,
    })
  },
  // 隐藏筛选
  hidefilter(){
    this.setData({
      showFilter:false
    })
  },
  // 筛选供应点状态
  filterStatus(e) {
    var id = e.currentTarget.dataset.id;
    if(id== '1'){
      this.setData({
        filterEnable: '1',
        selectStatus:false
      })
 
    }else{
      this.setData({
        filterEnable: null,
        selectStatus: false
      })
    }
    // 获取可配送供应点列表
    this.getSupplyList();

  },
  // 选择筛选品牌
  selectBrand(e){
    var index = e.currentTarget.dataset.id;
    var select = e.currentTarget.dataset.select;
    var brandList = this.data.brandList;
    brandList[index].select = !select;
    this.setData({
      brandList: brandList
    })
  },
  //完成筛选品牌
  filterBrand(){
    this.setData({
      showFilter: false
    })
    this.getSupplyList();
   
  },

  // 切换状态筛选窗
  showStatus(){
      this.setData({
        selectStatus: !this.data.selectStatus,
        showFilter:false,
      })
  },


  // 获取页面数据
  getPageData(datas){
    var brands = [];
    var that = this;
    this.data.brandList.map(function (item) {
      if (item.select) {
        brands.push(item.brand);
      }
    })
    var postData = {
      openId: datas.openId,
      brandList: brands,
      state: that.data.filterEnable,
    }
    if( datas.recId ){
      postData.recId = datas.recId
    }else{
      postData.latitude = datas.latitude;
      postData.longitude = datas.longitude;
    }
    app.requestFn({
      url: '/proapi/doSelectSupply',
      data: postData
    }, function (res) {
      that.setData({
        supplyList: res.supplys,
        isReady:true
      })

      wx.hideLoading();
    })

  },

  // 获取（筛选）供应点列表
  getSupplyList(){
    wx.showLoading({
      title: 'Loading...',
      mask:true
    })
    var that = this;
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        if (!app.globalData.recId) {
          that.getUserPosition(openId);
        } else {
          that.getPageData({
            openId:openId, 
            recId:app.globalData.recId
          });
        }
      }
    })
  },

  // 获取用户当前位置
  getUserPosition(openId) {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.getPageData({
          openId: openId,
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '定位失败，请先实名认证！',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/certification/certification',
              })
            } else {
              wx.navigateBack({
                delta: 1,
              })
            }
          }
        })
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      imgBaseUrl:app.configUrl.baseUrl
    })

   
  },
  onShow(){
    this.getSupplyList();     
  }

})