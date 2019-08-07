function myFunction() {
  //create trigger for function
  ScriptApp.newTrigger('processEmails')
      .timeBased()
      .everyMinutes(1)
      .create();
}

function processEmails() {
  // get inbox
  var threads = GmailApp.getInboxThreads();
  // if inbox not empty
  if (threads != null) {
    console.log("totale mails: "+threads.length);
    // for every email, get sender, date, insert a row and append data
    for (var i = threads.length - 1; i >= 0; i--) {
      for (var j = threads[i].getMessageCount() - 1; j >= 0; j--) {
        console.log("i: "+i +"---"+threads[i].getMessageCount());
        var messages = threads[i].getMessages();
        var senderEmail = messages[j].getFrom();
        var dateEmail = messages[j].getDate();
        if (messages[j].getSubject() == "Mail delivery failed: returning message to sender") {
          var ss = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1F36AX8kFC5pDmXVLStcnkfIbzfkuQDp6bRprSLfWZ8k/edit');
          var sheet = ss.getSheets()[0];
          sheet.insertRowBefore(2);
          var cell = sheet.getRange("A2");
          cell.setValue(dateEmail);
          var fullBody = messages[j].getPlainBody();
          fullBody = fullBody.substr(fullBody.search("failed:"));
          var splitForEmail = fullBody.split("\n");
          var emailFailed = splitForEmail[2];
          // console.log(emailFailed);
          cell = sheet.getRange("B2");
          cell.setValue(emailFailed);
          var electionName;
          // eforeftiki
          if (fullBody.search("εφορευτικής") > -1) {
            cell = sheet.getRange("C2");
            cell.setValue("Εφορευτική Επιτροπή");
            var rest = fullBody.substr(fullBody.search("ψηφοφορία"));
            rest = rest.split("\n");
            electionName = rest[2];
          } else { //user
            if (fullBody.search("ψηφοφορία:") > -1) {
              var rest = fullBody.substr(fullBody.search("ψηφοφορία:"));
              rest = rest.split("\n");
              electionName = rest[2];
            } else {
              var rest = fullBody.substr(fullBody.search("ψηφοφορία"));
              rest = rest.split(":");
              electionName = rest[1].split("Όνομα");
            }
            cell = sheet.getRange("C2");
            cell.setValue("Ψηφοφόρος");
            if (fullBody.search("email,") > -1) {
              var rest = fullBody.substr(fullBody.search("email,"));
              rest = rest.split("\n");
              cell = sheet.getRange("E2");
              cell.setValue(rest[2]);
            }
          }
          cell = sheet.getRange("D2");
          cell.setValue(electionName);
        } else {
          // open book, get first sheet from book - current month
          var ss = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1AJnSUx9cAPa74d8VJJ7MKLiX0NopxaIL18Y6CdvO6MA/edit');
          var sheet = ss.getSheets()[0];
          sheet.insertRowBefore(3);
          var cell = sheet.getRange("B3");
          cell.setValue(senderEmail);
          cell = sheet.getRange("A3");
          cell.setValue(dateEmail);
          cell = sheet.getRange("D3");
          cell.setValue('Pending');
        }
        //GmailApp.moveThreadToArchive(threads[i]);
        Gmail.Users.Messages.remove('me', threads[i].getId());
      }
    }
  }
}
