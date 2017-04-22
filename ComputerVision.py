import httplib, urllib
import requests
import Config

_url = 'westeurope.api.cognitive.microsoft.com'
json = {'url': 'http://weknownyourdreamz.com/images/park/park-07.jpg'}

headers = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': Config.MS_CV_KEY1,
}

params = urllib.urlencode({
    'visualFeatures': 'Categories,Tags',
    'details': 'Landmarks',
    'language': 'en',
})


def analize():
    try:
        conn = httplib.HTTPSConnection(_url)
        conn.request("POST", "/vision/v1.0/analyze?%s" % params, json, headers=headers)
        response = conn.getresponse()
        data = response.read()
        print(data)
        conn.close()
    except Exception as e:
        print('Error ' + e.message)


def analizeRequest():

    result = None

    while True:

        response = requests.post('https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories,Tags',data=json, headers=headers)

        if response.status_code == 200 or response.status_code == 201:

            if 'content-length' in response.headers and int(response.headers['content-length']) == 0:
                result = None
            elif 'content-type' in response.headers and isinstance(response.headers['content-type'], str):
                if 'application/json' in response.headers['content-type'].lower():
                    result = response.json() if response.content else None
                elif 'image' in response.headers['content-type'].lower():
                    result = response.content

        else:
            print("Error code: %d" % (response.status_code))
            print("Message: %s" % (response.json()['error']['message']))

        break

    print result