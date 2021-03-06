import urllib
import requests
import Config

_url = 'https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?'

headers = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': Config.MS_CV_KEY,
}

params = urllib.urlencode({
    'visualFeatures': 'Categories,Tags',
    'details': 'Landmarks',
    'language': 'en',
})

def analize(imageUrl):

    result = None

    json = {'url': imageUrl} #Just for testing -> urls taken as parameters

    while True:

        response = requests.post(_url + params, json=json, headers=headers)

        if response.status_code == 200 or response.status_code == 201:

            if 'content-length' in response.headers and int(response.headers['content-length']) == 0:
                result = None
            elif 'content-type' in response.headers and isinstance(response.headers['content-type'], str):
                if 'application/json' in response.headers['content-type'].lower():
                    result = response.json() if response.content else None
                elif 'image' in response.headers['content-type'].lower():
                    result = response.content

        else:
            print ("Error code: %d" % (response.status_code))
        break
    return result


def LookForObject(imageUrl, object):
    result = analize(imageUrl)
    if result == None:
        return False
    elif 'tags' in result:
         for tag in result['tags']:
             if tag['name'] == object:
                 return True
    elif 'categories' in result:
        for category in result['categories']:
             if category['name'] == object:
                 return True
    return False



