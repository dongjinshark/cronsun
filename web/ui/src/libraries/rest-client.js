var sendXHR = function(opt) {
  var xhr = new XMLHttpRequest();
  xhr.open(opt.method, opt.url, true);

  if (typeof opt.onexception == 'function') {
    var warpExceptionHandler = ()=>{
      opt.onexception(msg);
      typeof opt.onend == 'function' && opt.onend(xhr);
    }
    xhr.onabort=()=>{warpExceptionHandler('request aborted.')};
    xhr.onerror=()=>{warpExceptionHandler('request error.')};
    xhr.ontimeout=()=>{warpExceptionHandler('request timeout.')};
  }

  xhr.onreadystatechange = function(){
    if (xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }
    
    var data;
    if (typeof xhr.response != 'object') {
      try {
        data = JSON.parse(xhr.response)
      } catch(e) {
        data = xhr.response;
      }
    } else {
      data = xhr.response;
    }

    if (xhr.status != opt.successCode) {
      typeof opt.onfailed == 'function' && opt.onfailed(data, xhr);
    } else if (typeof opt.onsucceed == 'function') {
      opt.onsucceed(data, xhr);
    }

    typeof opt.onend == 'function' && opt.onend(xhr);
  }

  if (typeof opt.data == 'object') {
    opt.data = JSON.stringify(opt.data);
  }
  xhr.send(opt.data);
}

class request {
  constructor(url, method, data){
    this._url = url;
    this._method = method;
    this._data = data;
  }

  do(){
    sendXHR({
      method: this._method,
      url: this._url,
      data: this._data,
      successCode: this._successCode,
      onsucceed: this._onsucceed,
      onfailed: this._onfailed,
      onexception: this._onexception,
      onend: this._onend,
    });
  }

  onsucceed(successCode, f){
    this._successCode = successCode;
    this._onsucceed = f;
    return this;
  }

  onfailed(f){
    this._onfailed = f;
    return this;
  }

  onexception(f){
    this._onexception = f;
    return this;
  }

  onend(f){
    this._onend = f;
    return this;
  }
}

export default class Rest {
  constructor(prefix, defaultFailedHandler, defaultExceptionHandler){
    this.prefix = prefix;
    this.defaultFailedHandler = defaultFailedHandler; // function(url, resp){}
    this.defaultExceptionHandler = defaultExceptionHandler;
  };

  GET(url){
    return new request(this.prefix+url, 'GET')
      .onfailed(this.defaultFailedHandler)
      .onexception(this.defaultExceptionHandler);
  };

  POST(url, formdata){
    return new request(this.prefix+url, 'POST', formdata)
      .onfailed(this.defaultFailedHandler)
      .onexception(this.defaultExceptionHandler);
  };

  PUT(url, formdata){
    return new request(this.prefix+url, 'PUT', formdata)
      .onfailed(this.defaultFailedHandler)
      .onexception(this.defaultExceptionHandler);
  };

  DELETE(url){
    return new request(this.prefix+url, 'DELETE')
      .onfailed(this.defaultFailedHandler)
      .onexception(this.defaultExceptionHandler);
  }
}