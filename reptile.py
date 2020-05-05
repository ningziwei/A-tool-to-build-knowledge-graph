from bs4 import BeautifulSoup
from urllib.request import Request
from urllib.request import urlopen
from urllib.parse import urlencode
import zlib

def reptile(url):
    http_header = {
        'Accept': 'text/html, application/xhtml+xml, image/jxr, */*',
        'Accept-Language': 'zh-Hans-CN,zh-Hans;q=0.8,en-029;q=0.6,en-US;q=0.4,en;q=0.2',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'Keep-Alive',
    }
    # 模仿浏览器行为
    req = Request(url, None, http_header)
    # 获取服务器响应
    html = urlopen(req)
    #print(type(html))
    html = html.read()
    #print(type(html))
    #html = urlopen(url)
    try:
        html = zlib.decompress(html, 16 + zlib.MAX_WBITS).decode('utf-8')
    except:
        soup = BeautifulSoup(html, 'html.parser')
        [s.extract() for s in soup('script')]
        #print(soup.body.get_text())
    else:
        soup = BeautifulSoup(html, 'html.parser')
        [s.extract() for s in soup('script')]
        #print(soup.body.get_text())
    return soup.body.get_text()

if __name__ == "__main__":
    url = r"https://www.jianshu.com/p/71544b87bd0e"
    reptile(url)