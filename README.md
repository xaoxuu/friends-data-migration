# friends-data-migration

动态友链issues数据格式迁移

遍历每一个open状态的issue，将issue的body中的第一个json内容提取出来，进行格式转换，然后将转换后的json内容写入到issue的body中原本json的位置。

旧的格式：

```json
{
    "title": "MHuiG",
    "url": "https://blog.mhuig.top",
    "avatar": "https://bu.dusays.com/2022/10/23/63552e00b1e60.png",
    "screenshot": "https://i.loli.net/2020/08/22/d24zpPlhLYWX6D1.png",
    "description": "Be Yourself, Make a Difference."
}
```

新的格式：

```json
{
    "title": "MHuiG",
    "url": "https://blog.mhuig.top",
    "icon": "https://bu.dusays.com/2022/10/23/63552e00b1e60.png",
    "screenshot": "https://i.loli.net/2020/08/22/d24zpPlhLYWX6D1.png",
    "description": "Be Yourself, Make a Difference.",
    "feed": ""
}
```