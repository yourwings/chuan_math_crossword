Page({
  data: {},
  
  onLoad: function() {
    console.log('Home page loaded');
  },

  goToGame: function(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url: url,
        fail: function() {
          wx.showToast({
            title: '该游戏尚未适配小程序',
            icon: 'none'
          });
        }
      });
    }
  }
})
