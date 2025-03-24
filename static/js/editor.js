class Qbin{constructor(){if(this.currentPath=this.parsePath(window.location.pathname),this.CACHE_KEY="qbin/",this.isUploading=!1,this.lastUploadedHash="",this.autoUploadTimer=null,this.emoji={online:"☁️",inline:"☁",no:"⊘"},this.status=this.emoji.online,this.editor=document.getElementById("editor"),this.loadContent().then(()=>{}),this.currentPath.key.length<2){const t=API.generateKey(6);this.updateURL(t,this.currentPath.pwd,"")}this.initializeUI(),this.setupAutoSave(),this.initializePasswordPanel(),this.initializeKeyAndPasswordSync()}setupAutoSave(){window.addEventListener("beforeunload",()=>{this.saveToLocalCache()})}saveToLocalCache(t=!1){const e=this.editor.value;if(t||e.trim()&&cyrb53(e)!==this.lastUploadedHash){const t={content:e,timestamp:getTimestamp(),path:this.currentPath.key,hash:cyrb53(e)};storage.setCache(this.CACHE_KEY+this.currentPath.key,t)}}async loadFromLocalCache(t){try{const e=await storage.getCache(this.CACHE_KEY+(t||this.currentPath.key));if(e){const s=this.parsePath(window.location.pathname),i=s.key.length<2||t,a=s.key===e.path;if(i||a)return this.status=this.emoji.inline,this.editor.value=e.content,document.querySelector(".upload-area").classList.toggle("visible",!1),this.lastUploadedHash=cyrb53(e.content),[!0,e.timestamp]}return[!1,0]}catch(t){return console.error("加载缓存失败:",t),[!1,0]}}async loadContent(){const{key:t,pwd:e,render:s}=this.currentPath;if(t.length>1){const[i,a]=await this.loadFromLocalCache();this.updateURL(t,e,"replaceState"),document.querySelector(".key-watermark").textContent=`${this.status} ${this.currentPath.key}`,"e"===s&&getTimestamp()-a>5&&(await this.loadOnlineCache(t,e,i),document.querySelector(".key-watermark").textContent=`${this.status} ${this.currentPath.key}`)}else{const t=JSON.parse(sessionStorage.getItem("qbin/last")||'{"key": null}');if(!t.key)return null;await this.loadFromLocalCache(t.key),this.updateURL(t.key,t.pwd,"replaceState"),document.getElementById("key-input").value=t.key.trim()||"",document.getElementById("password-input").value=t.pwd.trim()||"",document.querySelector(".key-watermark").textContent=`${this.status} ${this.currentPath.key}`}}initializeUI(){let t;/iPad|iPhone|iPod/.test(navigator.userAgent)&&window.visualViewport.addEventListener("resize",()=>{}),this.editor.addEventListener("input",()=>{clearTimeout(t),t=setTimeout(()=>{this.saveToLocalCache()},1e3),clearTimeout(this.autoUploadTimer),this.autoUploadTimer=setTimeout(()=>{const t=this.editor.value;t.trim()&&cyrb53(t)!==this.lastUploadedHash&&this.handleUpload(t.trimEnd(),"text/plain; charset=UTF-8")},2e3)}),this.editor.addEventListener("paste",t=>{const e=t.clipboardData.items;for(let s of e)if(0===s.type.indexOf("image/")){t.preventDefault();const e=s.getAsFile();return void this.handleUpload(e,e.type)}}),this.editor.addEventListener("dragover",t=>{t.preventDefault(),this.editor.classList.add("drag-over")}),this.editor.addEventListener("dragleave",()=>{this.editor.classList.remove("drag-over")}),this.editor.addEventListener("drop",t=>{t.preventDefault(),this.editor.classList.remove("drag-over");const e=t.dataTransfer.files;if(e.length>0){const t=e[0];this.handleUpload(t,t.type)}});const e=document.querySelector(".upload-area"),s=document.getElementById("file-input"),i=()=>{const t=!this.editor.value.trim();e.classList.toggle("visible",t)};i(),this.editor.addEventListener("input",()=>{i()}),s.addEventListener("change",t=>{if(t.target.files.length>0){const e=t.target.files[0];this.handleUpload(e,e.type)}}),this.editor.addEventListener("dragenter",t=>{t.preventDefault(),this.editor.value.trim()||e.classList.add("visible"),this.editor.classList.add("drag-over"),this.editor.style.transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"}),this.editor.addEventListener("dragleave",t=>{t.preventDefault(),t.relatedTarget&&this.editor.contains(t.relatedTarget)||(this.editor.classList.remove("drag-over"),this.editor.style.transition="all 0.3s ease")}),this.editor.addEventListener("focus",()=>{document.body.classList.add("editor-focused")}),this.editor.addEventListener("blur",()=>{document.body.classList.remove("editor-focused")})}async loadOnlineCache(t,e,s,i=!0){if(!this.isUploading)try{this.isUploading=!0,this.updateUploadStatus("数据加载中…");let a="";const{status:o,content:n}=await API.getContent(t,e);return!(!n&&200!==o&&404!==o)&&(this.lastUploadedHash=cyrb53(n||""),404===o?(this.status=this.emoji.online,this.saveToLocalCache(!0),a="这是可用的KEY"):s&&this.lastUploadedHash!==cyrb53(this.editor.value)?await this.showConfirmDialog("检测到本地缓存与服务器数据不一致，您想使用哪个版本？\n\n"+"• 本地版本：保留当前编辑器中的内容\n"+"• 服务器版本：加载服务器上的最新内容")&&(this.status=this.emoji.online,this.editor.value=n,this.saveToLocalCache(!0),a="远程数据加载成功"):(this.status=this.emoji.online,this.editor.value=n||"",this.saveToLocalCache(!0),a="数据加载成功"),document.querySelector(".upload-area").classList.toggle("visible",!1),this.updateUploadStatus(a||"数据加载成功","success"),!0)}catch(t){i=!1,this.updateUploadStatus("数据加载失败："+t.message),console.error(t)}finally{this.isUploading=!1,setTimeout(()=>{this.updateUploadStatus("")},i?2e3:5e3)}}showConfirmDialog(t){return new Promise(e=>{const s=document.querySelector(".confirm-overlay"),i=document.querySelector(".confirm-dialog");i.querySelector(".confirm-dialog-content").textContent=t;const a=()=>{s.classList.remove("active"),i.classList.remove("active")},o=t=>{const c=t.target.closest(".confirm-button");if(!c)return;const d=c.dataset.action;a(),i.removeEventListener("click",o),s.removeEventListener("click",n),document.removeEventListener("keydown",r),e("confirm"===d)},n=()=>{a(),e(!1)},r=t=>{"Escape"===t.key?(a(),e(!1)):"Enter"===t.key&&(a(),e(!0))};i.addEventListener("click",o),s.addEventListener("click",n),document.addEventListener("keydown",r),s.classList.add("active"),i.classList.add("active")})}async handleUpload(t,e,s=!0){if(this.isUploading)return;if(!t)return;const i=!e.includes("text/");let a="保存中…";if(i){const e=t.size/1024,s=e<1024?`${e.toFixed(1)}KB`:`${(e/1024).toFixed(1)}MB`;a=`上传中 ${t.name} (${s})`}this.updateUploadStatus(a,"loading");try{this.isUploading=!0;const a=document.getElementById("key-input"),o=document.getElementById("password-input");let n=this.currentPath.key||a.value.trim()||API.generateKey(6);const r=this.currentPath.key===n?"replaceState":"pushState",c=o.value.trim(),d=cyrb53(t);i&&t.size>1024*1024&&(document.querySelector(".upload-icon").innerHTML="⏳",document.querySelector(".upload-text").textContent="正在处理，请稍候..."),await API.uploadContent(t,n,c,e)&&(i||(this.lastUploadedHash=d),this.status=this.emoji.online,i?this.updateUploadStatus(`文件 ${t.name} 上传成功`,"success"):this.updateUploadStatus("内容保存成功","success"),this.updateURL(n,c,r),document.querySelector(".key-watermark").textContent=`${this.status} ${this.currentPath.key}`,i&&setTimeout(()=>{window.location.assign(`/p/${n}/${c}`)},800))}catch(t){s=!1;let e="保存失败";e=t.message.includes("size")?"文件大小超出限制":t.message.includes("network")||t.message.includes("connect")?"网络连接失败，请检查网络":`保存失败: ${t.message}`,this.updateUploadStatus(e,"error"),this.status=this.emoji.no,document.querySelector(".key-watermark").textContent=`${this.status} ${this.currentPath.key}`,console.error(t)}finally{this.isUploading=!1,i&&"⏳"===document.querySelector(".upload-icon").innerHTML&&(document.querySelector(".upload-icon").innerHTML="📁",document.querySelector(".upload-text").textContent="点击或拖拽文件到此处上传"),setTimeout(()=>{this.updateUploadStatus("")},s?2e3:5e3)}}updateUploadStatus(t,e){const s=document.getElementById("upload-status");if(s){if(!t)return s.textContent="",void s.classList.remove("visible");s.removeAttribute("data-status"),t.includes("成功")?s.setAttribute("data-status","success"):t.includes("失败")?s.setAttribute("data-status","error"):(t.includes("加载"),s.setAttribute("data-status","info")),s.textContent=t,requestAnimationFrame(()=>{s.classList.add("visible")})}}initializePasswordPanel(){const t=document.querySelector(".bookmark"),e=document.querySelector(".password-panel");let s=!1,i=null,a=null;const o=document.getElementById("encrypt-checkbox"),n=document.getElementById("encryptData"),r=document.querySelector(".option-toggle"),c=()=>/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)||window.innerWidth<=768,d=()=>{clearTimeout(a),e.classList.add("active")},l=()=>{s||(e.classList.remove("active"),e.style.transform="")};if(c()){let s,i;t.style.cursor="pointer";let a=!1;t.addEventListener("touchstart",t=>{s=getTimestamp(),i=t.touches[0].clientY,a=!1},{passive:!0}),t.addEventListener("touchmove",t=>{Math.abs(t.touches[0].clientY-i)>10&&(a=!0)},{passive:!0}),t.addEventListener("touchend",t=>{const i=getTimestamp()-s;!a&&i<250&&(t.preventDefault(),e.classList.contains("active")?l():d())}),document.addEventListener("click",s=>{e.classList.contains("active")&&!e.contains(s.target)&&!t.contains(s.target)&&l()},!0);let o=0,n=0;e.addEventListener("touchstart",t=>{(t.target===e||t.target.closest(".password-panel-title"))&&(o=t.touches[0].clientY,n=o)},{passive:!0}),e.addEventListener("touchmove",t=>{if(0!==o){const s=(n=t.touches[0].clientY)-o;s>0&&(t.preventDefault(),e.style.transform=`translateY(${s}px)`,e.style.transition="none")}},{passive:!1}),e.addEventListener("touchend",()=>{if(0!==o){const t=n-o;e.style.transition="all 0.3s ease",t>50?l():e.style.transform="",o=0}})}else t.addEventListener("mouseenter",()=>{clearTimeout(a),i=setTimeout(d,100)}),t.addEventListener("mouseleave",()=>{clearTimeout(i),a=setTimeout(l,500)}),e.addEventListener("mouseenter",()=>{clearTimeout(a),clearTimeout(i)}),e.addEventListener("mouseleave",()=>{s||(a=setTimeout(l,500))});e.querySelectorAll("input, select").forEach(t=>{t.addEventListener("focus",()=>{s=!0,clearTimeout(a)}),t.addEventListener("blur",()=>{s=!1,c()||e.matches(":hover")||(a=setTimeout(l,800))})}),document.addEventListener("keydown",t=>{"Escape"===t.key&&e.classList.contains("active")&&l()}),r.addEventListener("click",function(){o.classList.contains("checked")?(o.classList.remove("checked"),n.checked=!1):(o.classList.add("checked"),n.checked=!0)}),n.checked&&o.classList.add("checked"),document.getElementById("preview-button").addEventListener("click",()=>{const t=this.currentPath.key,e=this.currentPath.pwd;t&&(this.saveToLocalCache(!0),sessionStorage.setItem("qbin/last",JSON.stringify({key:t,pwd:e,timestamp:getTimestamp()})),window.location.href=`/p/${t}/${e}`)}),document.getElementById("code-button").addEventListener("click",()=>{const t=this.currentPath.key,e=this.currentPath.pwd;t&&(this.saveToLocalCache(!0),sessionStorage.setItem("qbin/last",JSON.stringify({key:t,pwd:e,timestamp:getTimestamp()})),window.location.href=`/c/${t}/${e}`)}),document.getElementById("md-button").addEventListener("click",()=>{const t=this.currentPath.key,e=this.currentPath.pwd;t&&(this.saveToLocalCache(!0),sessionStorage.setItem("qbin/last",JSON.stringify({key:t,pwd:e,timestamp:getTimestamp()})),window.location.href=`/m/${t}/${e}`)})}initializeKeyAndPasswordSync(){const t=document.getElementById("key-input"),e=document.getElementById("password-input"),s=document.querySelector(".key-watermark");t.value=this.currentPath.key,e.value=this.currentPath.pwd,s.textContent=`${this.status} ${this.currentPath.key}`;const i=()=>{const i=t.value.trim(),a=e.value.trim();i.length>=2&&this.updateURL(i,a,"replaceState"),s.textContent=`${this.emoji.inline} ${this.currentPath.key}`};t.addEventListener("input",i),e.addEventListener("input",i)}updateURL(t,e,s="replaceState"){if(t&&t.length<2)return;const{render:i}=this.parsePath(window.location.pathname),a=["e","p","c","m"].includes(i)?`/${i}`:"/e",o=t||e?`${a}/${t}/${e}`:a||"/e";this.currentPath={render:i,key:t,pwd:e};const n=window.history[s];n?n.call(window.history,null,"",o):console.error(`Invalid history action: ${s}`)}parsePath(t){const e=t.split("/").filter(Boolean);let s={key:"",pwd:"",render:""};return 0===e.length?s:(1===e[0].length?(s.key=e[1]||"",s.pwd=e[2]||"",s.render=e[0]):(s.key=e[0]||"",s.pwd=e[1]||"",s.render=""),s)}getMimeTypeFromFileName(t){return{txt:"text/plain; charset=UTF-8",md:"text/markdown",csv:"text/csv",html:"text/html",htm:"text/html",css:"text/css",js:"text/javascript",json:"application/json",xml:"application/xml",pdf:"application/pdf",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",ppt:"application/vnd.ms-powerpoint",pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation",odt:"application/vnd.oasis.opendocument.text",ods:"application/vnd.oasis.opendocument.spreadsheet",odp:"application/vnd.oasis.opendocument.presentation",rtf:"application/rtf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",svg:"image/svg+xml",webp:"image/webp",bmp:"image/bmp",ico:"image/x-icon",tiff:"image/tiff",tif:"image/tiff",mp3:"audio/mpeg",wav:"audio/wav",ogg:"audio/ogg",flac:"audio/flac",aac:"audio/aac",m4a:"audio/mp4",mp4:"video/mp4",webm:"video/webm",ogv:"video/ogg",avi:"video/x-msvideo",mov:"video/quicktime",wmv:"video/x-ms-wmv",mkv:"video/x-matroska",zip:"application/zip",rar:"application/x-rar-compressed","7z":"application/x-7z-compressed",tar:"application/x-tar",gz:"application/gzip",epub:"application/epub+zip",exe:"application/x-msdownload",dmg:"application/x-apple-diskimage",iso:"application/x-iso9660-image",apk:"application/vnd.android.package-archive",ics:"text/calendar",ttf:"font/ttf",woff:"font/woff",woff2:"font/woff2"}[t.toLowerCase().split(".").pop()]||"application/octet-stream"}debounce(t,e){return clearTimeout(this.debounceTimeout),new Promise(s=>{this.debounceTimeout=setTimeout(()=>{s(t())},e)})}}const API={generateKey(t=10){const e="ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";return Array.from({length:t},()=>e.charAt(Math.floor(Math.random()*e.length))).join("")},async handleAPIError(t){if(t.headers.get("Content-Type").includes("application/json"))try{return(await t.json()).message||"请求失败"}catch(e){return this.getErrorMessageByStatus(t.status)}return this.getErrorMessageByStatus(t.status)},getErrorMessageByStatus:t=>t>=500?"服务器出错，请稍后重试":404===t?"请求的资源不存在":403===t?"无访问权限":401===t?"未授权访问":400===t?"请求参数错误":"请求失败",async getContent(t,e){try{const s=await this.fetchWithCache(`/r/${t}/${e}`);if(!s.ok&&404!==s.status){const t=await this.handleAPIError(s);throw new Error(t)}const i=s.headers.get("Content-Type")||"";if(!i.startsWith("text/")&&!i.includes("json")&&!i.includes("javascript")&&!contentTy/pe.includes("xml"))throw new Error("不支持的文件类型");return{status:s.status,content:await s.text()}}catch(t){throw console.error("获取数据失败:",t),t}},async uploadContent(t,e,s="",i="application/octet-stream"){const a=document.querySelector(".expiry-select");try{const o=5*1024*1024,n=i.includes("text/")?"POST":"PUT",r=t;let c={"x-expire":a.options[a.selectedIndex].value,"Content-Type":i};if(t.size>o)throw new Error(["上传内容超出",o/1024/1024,"MB限制"].join(""));const d=await fetch(`/s/${e}/${s}`,{method:n,body:r,headers:c});if(!d.ok){const t=await this.handleAPIError(d);throw new Error(t)}return"success"===(await d.json()).status}catch(t){throw console.error("上传失败:",t),t}},async fetchWithCache(t){try{const e=await caches.open("qbin-cache-v1"),s=await e.match(t),i=new Headers;if(s){const t=s.headers.get("ETag"),e=s.headers.get("Last-Modified");t&&i.set("If-None-Match",t),e&&i.set("If-Modified-Since",e)}const a=await fetch(t,{headers:i,credentials:"include"});return 304===a.status&&s?s:a.ok?(await e.put(t,a.clone()),a):(a.ok||await e.delete(t),a)}catch(s){const i=await e.match(t);if(i)return i;throw s}}};class StorageManager{constructor(t="qbin",e=2){this.dbName=t,this.version=e,this.storeName="qbin",this.db=null,this.indexedDB=this._getIndexedDB()}_getIndexedDB(){const t=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;if(!t)throw new Error("当前浏览器不支持 IndexedDB");return t}_handleError(t){throw console.error("数据库操作错误:",t),new Error(`数据库操作失败: ${t.message}`)}_getTransaction(t="readonly"){if(!this.db)throw new Error("数据库未初始化");try{return this.db.transaction([this.storeName],t)}catch(t){this._handleError(t)}}async initialize(){if(!this.db)try{return new Promise((t,e)=>{const s=this.indexedDB.open(this.dbName,this.version);s.onerror=(()=>{this._handleError(s.error),e(s.error)}),s.onblocked=(()=>{const t=new Error("数据库被阻塞，可能存在其他连接");this._handleError(t),e(t)}),s.onsuccess=(()=>{this.db=s.result,this.db.onerror=(t=>{this._handleError(t.target.error)}),t()}),s.onupgradeneeded=(t=>{const e=t.target.result;e.objectStoreNames.contains(this.storeName)||e.createObjectStore(this.storeName,{keyPath:"key"}).createIndex("timestamp","timestamp",{unique:!1})})})}catch(t){this._handleError(t)}}async setCache(t,e,s=86400*7,i=3){let a=0;for(;a<i;)try{return await this.initialize(),new Promise((i,a)=>{const o=this._getTransaction("readwrite"),n=o.objectStore(this.storeName),r={key:t,value:e,timestamp:getTimestamp(),exipre:s},c=n.put(r);c.onerror=(()=>a(c.error)),c.onsuccess=(()=>i(!0)),o.oncomplete=(()=>i(!0)),o.onerror=(()=>a(o.error))})}catch(t){++a===i&&this._handleError(t),await new Promise(t=>setTimeout(t,1e3))}}async getCache(t){try{return await this.initialize(),new Promise((e,s)=>{const i=this._getTransaction("readonly").objectStore(this.storeName).get(t);i.onerror=(()=>s(i.error)),i.onsuccess=(()=>{e(i.result?i.result.value:null)})})}catch(t){this._handleError(t)}}async removeCache(t,e={silent:!1}){try{if(await this.initialize(),!await this.getCache(t)&&!e.silent)throw new Error(`Cache key '${t}' not found`);return new Promise((e,s)=>{const i=this._getTransaction("readwrite"),a=i.objectStore(this.storeName).delete({key:t});a.onerror=(()=>{s(a.error)}),i.oncomplete=(()=>{e(!0)}),i.onerror=(t=>{s(new Error(`Failed to remove cache: ${t.target.error}`))}),i.onabort=(t=>{s(new Error(`Transaction aborted: ${t.target.error}`))})})}catch(t){return e.silent||this._handleError(t),!1}}async removeCacheMultiple(t,e={continueOnError:!0}){try{await this.initialize();const s={success:[],failed:[]};for(const i of t)try{await this.removeCache(i,{silent:!0}),s.success.push(i)}catch(t){if(s.failed.push({key:i,error:t.message}),!e.continueOnError)throw t}return s}catch(t){this._handleError(t)}}async getAllCacheKeys(t={sorted:!1,filter:null,limit:null,offset:0}){try{return await this.initialize(),new Promise((e,s)=>{const i=this._getTransaction("readonly"),a=i.objectStore(this.storeName).getAll();a.onerror=(()=>s(a.error)),a.onsuccess=(()=>{let s=a.result.map(t=>({key:t.key,timestamp:t.timestamp}));if(t.filter&&"function"==typeof t.filter&&(s=s.filter(t.filter)),t.sorted&&s.sort((t,e)=>e.timestamp-t.timestamp),t.offset||t.limit){const e=t.offset||0,i=t.limit?e+t.limit:void 0;s=s.slice(e,i)}e(s.map(t=>t.key))}),i.onerror=(t=>{s(new Error(`Failed to get cache keys: ${t.target.error}`))})})}catch(t){this._handleError(t)}}async getCacheStats(){try{return await this.initialize(),new Promise((t,e)=>{const s=this._getTransaction("readonly"),i=s.objectStore(this.storeName),a=i.count(),o=i.getAll();let n=0,r=0,c=getTimestamp(),d=0;a.onsuccess=(()=>{n=a.result}),o.onsuccess=(()=>{const e=o.result;r=new Blob([JSON.stringify(e)]).size,e.forEach(t=>{c=Math.min(c,t.timestamp),d=Math.max(d,t.timestamp)}),t({count:n,totalSize:r,oldestTimestamp:n>0?c:null,newestTimestamp:n>0?d:null,averageSize:n>0?Math.round(r/n):0})}),s.onerror=(t=>{e(new Error(`Failed to get cache stats: ${t.target.error}`))})})}catch(t){this._handleError(t)}}async clearExpiredCache(t=100){try{await this.initialize();const e=getTimestamp();return new Promise((s,i)=>{const a=this._getTransaction("readwrite").objectStore(this.storeName).index("timestamp");let o=0;const n=()=>{const r=a.openCursor();let c=0;r.onerror=(()=>i(r.error)),r.onsuccess=(i=>{const a=i.target.result;a&&c<t?(e-a.value.timestamp>a.value.exipre&&(a.delete(),o++),c++,a.continue()):c===t?setTimeout(n,0):s(o)})};n()})}catch(t){this._handleError(t)}}}const storage=new StorageManager;new Qbin;const getTimestamp=()=>Math.floor(Date.now()/1e3);function cyrb53(t,e=512){let s=3735928559^e,i=1103547991^e;for(let e,a=0;a<t.length;a++)e=t.charCodeAt(a),s=Math.imul(s^e,2246822519),i=Math.imul(i^e,3266489917);return s^=Math.imul(s^i>>>15,1935289751),i^=Math.imul(i^s>>>15,3405138345),2097152*((i^=(s^=i>>>16)>>>16)>>>0)+(s>>>11)}
