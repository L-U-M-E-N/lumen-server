module.exports = function() {   
  /**
   * Gets the date time.
   *
   * @return     {string}  The date time.
   */
  this.getDateTime = function () {
      var date = new Date();

      var hour = date.getHours();
      hour = (hour < 10 ? '0' : '') + hour;

      var min  = date.getMinutes();
      min = (min < 10 ? '0' : '') + min;

      var sec  = date.getSeconds();
      sec = (sec < 10 ? '0' : '') + sec;

      var year = date.getFullYear();

      var month = date.getMonth() + 1;
      month = (month < 10 ? '0' : '') + month;

      var day  = date.getDate();
      day = (day < 10 ? '0' : '') + day;

    return day + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec;
  };
  /**

  /**
   * Color a text
   *
   * @param      {string}  text    The text to log
   * @return     {string}  text    The colored text
   */
  this.redText = function(string) {
      return '\u001b[31m'+string+'\u001b[39m';
  };
  this.greenText = function(string) {
      return '\u001b[32m'+string+'\u001b[39m';
  };
  this.yellowText = function(string) {
      return '\u001b[33m'+string+'\u001b[39m';
  };
  this.blueText = function(string) {
      return '\u001b[36m'+string+'\u001b[39m';
  };

  this.consoleReset = function () {
    return process.stdout.write('\033c');
  }
  /**
   * Write a thing in console
   *
   * @param      {string}  text    The text to log
   * @param      {<type>}             type    The type of text (for color)
   * @param      {boolean}            nodate  Activate the date log ?
   */
  this.log = function (msg, type, nodate) {
    var text = msg;
    switch(type) {
      case 'warn':
      text = redText('WARNING:') + yellowText(text);
      break;
      case 'error':
      text = redText('ERROR:') + redText(text);
      break;
      case 'fail':
      text = yellowText(text);
      break;
      case 'success':
      text = greenText(text);
      break;
      case 'info':
      text = blueText(text);
      break;
      case 'boot':
      text = yellowText('[!]') + ':' + text;
      break;
      default:
      }
      if(!nodate) { text = logdate() + '  ' + text;}

      console.log(text);
  };
  /**
   * Retourner la date en jaune
   *
   * @return     {string}  text    Date en jaune
   */
  this.logdate = function() {
      return yellowText(getDateTime());
  };
};