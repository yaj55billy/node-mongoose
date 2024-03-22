const headers = require('./headers');
const errorHandle = (res, error) => {
  res.writeHead(400, headers);

  let message = "";
  if(error) {
    message = error.message;
  } else {
    message = "欄位未填寫正確，或無此 ID"
  }

  res.write(JSON.stringify({
    "status": "false",
    message
  }));
  res.end();
}
module.exports = errorHandle;