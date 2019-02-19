var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      isReady:false,
      regid:'',
      userName:'',
      userPhone:'',
      userDetail:'',
      region: '请选择',
      hasSelect:false,
      btnText:"确认修改地址"
  },
  onLoad(res){
    if(res.regid){
      this.setData({
        regid:res.regid
      })

      this.getAddressInfo(res.regid);

    }
  },
  getAddressInfo(addressid){
    var that = this;
     app.requestFn({
       url:'/proapi/doEnEditReceiving',
       data:{
         regid: addressid
       }
     },function(res){
        var data = res.receiving;
        that.setData({
          userName:data.regname,
          userPhone:data.regphone,
          userDetail:data.address,
          region:[
            data.province,
            data.city,
            data.region
          ],
          hasSelect:true,
          isReady:true
        })
     }) 

  },

  bindRegionChange: function (e) {
    this.setData({
      region:e.detail.value,
      hasSelect: true
    })
  },

  changeName(e){
    this.setData({
      userName : e.detail.value
    })
  },
  changePhone(e){
    this.setData({
      userPhone: e.detail.value
    })
  },
  changeDetail(e) {
    this.setData({
      userDetail: e.detail.value
    })
  },
  saveAddress(){
      const {regid, userName, userPhone, userDetail,region, hasSelect} = this.data
      if(userName.length <= 0 || !userName){
          wx.showModal({
            title: '警告',
            content: '请输入收货人姓名',
          })
          return false;
      } else if (userPhone.length <= 0 || !userName){
        wx.showModal({
          title: '警告',
          content: '请输入收货人电话号码',
        })
        return false;
      } else if (!hasSelect ){
        wx.showModal({
          title: '警告',
          content: '请选择所在省市区',
        })
          return false;
      }else if(userDetail.length<=0 || !userDetail){
        wx.showModal({
          title: '警告',
          content: '请填写详细地址',
        })
        return false;
      }else{

        wx.showLoading({
          title: '',
        })
        app.getUserOpenId(function (err, openId) {
          if (!err) {
            const postData = {
              regid: regid,
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
                content: '修改成功',
                success:function(){
                  wx.navigateBack();                  
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