url_1 = 'https://twitter.com/elonmusk'
url_01 = '/elonmusk'
url_2 = 'https://twitter.com/elonmusk/with_replies'
url_02 = '/elonmusk/with_replies'
url_3 = 'https://twitter.com/elonmusk/likes'
url_03 = '/elonmusk/likes'


header =  {'User-Agent': choice(USER_AGENTS),}
proxy = choice(proxy_list)
try:
    if use_proxy:
        data = {"hostname": "www.twitter.com",
        "path": url_01,
        "port": "443",
        "method": "GET",
        "headers": header}
        logger.info("Running the request with this proxy: " + proxy)
        r = requests.post(proxy, json=data)
    else:
        logger.info("Running the request without a proxy")
        r = httpx.get(url,headers=header)
    r.raise_for_status()
    html = r.text
