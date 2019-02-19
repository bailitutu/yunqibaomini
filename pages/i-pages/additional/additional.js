// pages/i-pages/additional/additional.js
Page({
  gasWarn(){
    wx.navigateTo({
      url: '../gas-warn/gas-warn',
    })
  },
  goToPage(e) {
    const { url } = e.currentTarget.dataset;
    
    wx.navigateTo({
      url: url
    });
  },
  waiting(){
    wx.showToast({
      title: '即将推出，敬请期待！',
      icon:"none"
    })
  }

})