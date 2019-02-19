App({
  onLaunch(){
  },
  globalData: {
    hasLogin: false,
    validation:false, //是否实名认证；
    openId: null,
    addressId:null,
    recId: null,
    po_info: {
      lat: '',
      lng: ''
    }
  },
  configUrl:{
     imgBase:'https://www.yqb168.com',
     baseUrl:'https://www.yqb168.com',
    // baseUrl:'http://192.168.10.151:8080/YQB',

  }, 
  // 获取用户openID；
  getUserOpenId: function (callback) {
    var self = this;
    if (self.globalData.openId) {
      callback(null, self.globalData.openId);
    } else {
      wx.login({
        success: function (data) {
          self.requestFn({
            url: '/proapi/GetOpenid',
            data: {
              code: data.code
            }
          }, function (res) {
            self.globalData.hasLogin = true;
            self.globalData.openId = res.openId;
            if(res.recId){
              self.globalData.recId = res.recId;
            }
            callback(null, self.globalData.openId)
          })
        },
        fail: function (err) {
          callback(err)
        }
      })
    }
  },
  // 常规请求
  requestFn:function(option,success,failFn){
    var self = this;
    var url = this.configUrl.baseUrl + option.url;
    var data = option.data ? option.data : '';
    wx.request({
      url:url,
      method:'post',
      data:data,
      success: function(res){
        if (res.data.head.respCode === '0000000') {
          success(res.data.body)
        }else{
          failFn ? failFn(res) : self.errorFn(res)
        }
      },fail:function(err){
           wx.hideLoading();
           wx.showModal({
             title: '提示',
             content: '系统异常'
           })
      }
    })
  },

  errorFn(res){
    wx.hideLoading();
    wx.showModal({
      title: '提示',
      content: res.data.head.respContent
    })
  },
  isMoney(money){
    var reg = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
    var isMoney = reg.test(money);
    return isMoney;
  },
  isPhone(phone){
    let phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/; 
    if (!phoneReg.test(phone)) {
      return false;
    } else {
      return true;
    }  
  }
  
})
