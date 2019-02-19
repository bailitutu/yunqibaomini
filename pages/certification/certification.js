// pages/certification/certification.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName:'',//实名
    userSex:'', //实际性别
    userIdCard:'', //实际身份证号
    userAddress:'',//实际居住地
    userInvestCode:'',// 邀请码
    idCardA:'', //身份证
    idCardUrla:'',// 身份证图片地址
    address_name:'',//收货人姓名
    address_phone:'',//收货人手机号
    address_region: '请选择', //收货人地区
    address_Detail:'', //收货人详细地址
    hasSelect:false
  },

  changeCode(e){
    this.setData({
      userInvestCode: e.detail.value
    })
  },

  changeName(e) {
    this.setData({
      address_name: e.detail.value
    })
  },
  changePhone(e) {
    this.setData({
      address_phone: e.detail.value
    })
  },
  changeDetail(e) {
    this.setData({
      address_Detail: e.detail.value
    })
  },

  bindRegionChange: function (e) {
    this.setData({
      address_region: e.detail.value,
      hasSelect: true
    })
  },

  // 实名认证
  uploadImage: function (e) {

    var baseUrl = app.configUrl.baseUrl;
    var that = this;
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        wx.showLoading({
          title: '认证中...',
          mask: true,
        })
        wx.uploadFile({
          url: baseUrl + '/filesvr/uploadifyIdCard',
          filePath: tempFilePaths[0],
          name: 'image',
          header: {
            "Content-Type": "multipart/form-data"
          },
          name: 'file',
          formData: {},
          success: function (res) {
            var data = JSON.parse(res.data)
            if (data.head.respCode == '0000000') {
              that.setData({
                idCardA: tempFilePaths[0],
                idCardUrla: data.body.upfileFilePath,
                userName: data.body.idCard.name,
                userSex: data.body.idCard.sex,
                userIdCard: data.body.idCard.num,
                userAddress: data.body.idCard.address,
              });
            }
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: '请核对实名认证信息是否正确！',
              showCancel: false,
            })

          }, error() {
            wx.showModal({
              title: '提示',
              content: '实名认证失败，请重新上传',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  that.setData({
                    idCardA: '',
                    idCardUrla: '',
                    userName: '',
                    userSex: '',
                    userIdCard: '',
                    userAddress: '',
                  });
                }
              }
            })
          }
        })
      }
    })
  },

  // 提交验证

  submitData:function(){
    var postData = {
      name: this.data.userName,
      sex: this.data.userSex,
      idCard: this.data.userIdCard,
      cardA: this.data.idCardUrla,
      cardAddress:this.data.userAddress,
      regname:this.data.address_name,
      regphone:this.data.address_phone,
      province: this.data.address_region[0],
      city: this.data.address_region[1],
      region: this.data.address_region[2],
      address: this.data.address_Detail,
    }

    if (postData.name == '' || !postData.name){
      wx.showModal({
        title: '提示',
        content: '请进行实名认证',
      })
      return false;
    }
    if (postData.regname.length <= 0 || !postData.regname) {
      wx.showModal({
        title: '提示',
        content: '请输入收货人姓名',
      })
      return false;
    } else if (postData.regphone.length <= 0 || !postData.regphone) {
      wx.showModal({
        title: '提示',
        content: '请输入收货人手机号',
      })
      return false;
    } else if (!app.isPhone(postData.regphone)) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号',
      })
      return false;
    }  else if (!this.data.hasSelect) {
      wx.showModal({
        title: '提示',
        content: '请选择所在省市区',
      })
      return false;
    } else if (postData.address.length <= 0 || !postData.address) {
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
      })
      return false;
    }
    wx.showLoading({
      title: '提交中...',
      mask:true
    })
    app.getUserOpenId(function (err, openId) {
      postData.id = openId;
      if (!err) {
        app.requestFn({
          url: '/proapi/doAuthentication',
          data: postData
        }, function (res) {
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/i-pages/payPassword/payPassword',
          })
        })
      } 
    })
  },



})