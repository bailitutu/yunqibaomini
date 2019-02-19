// pages/i-pages/recommend/recommend.js
Page({
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '运气宝',
      path: '/pages/index/index',
      imageUrl:'/img/recommend_img.jpg'
    }
  }
})