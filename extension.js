// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var io = require('socket.io-client');
var config = vscode.workspace.getConfiguration('mpanjifaVotabia');
var socket;
var status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
var currentStatus = 'STOP';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  if (config.votabiaServerURL) {
    socket = io(config.votabiaServerURL);
    context.subscriptions.push(status);
    status.show();

    socket.on('pomodoro', function(data) {
      if (currentStatus !== data.status) {
        var message;
        currentStatus = data.status;
        switch (data.status) {
          case 'WORK':
            message = 'Let\'s work!!';
            break;
          case 'BREAK':
            message = 'You can have some rest.';
            break;
          case 'LONG BREAK':
            message = 'It\'s finally time for a long break.';
            break;
          case 'STOP':
            message = 'Just stop.';
            break;
        }
        vscode.window.showInformationMessage(message);
      }
      updateTimer(data);
    });

    socket.on('error', function(){
      status.hide();
    });

    socket.on('connect_failed', function(){
      status.hide();
    });

    socket.on('disconnect', function(){
      status.hide();
    });
  }
}

function updateTimer(data) {
  if (data.status) {
    status.text = `${(data.status == 'WORK' ? 'ⓦ ' : 'ⓑ ')} ${data.status} - ${data.timer}`;
    status.color = (data.status == 'WORK' ? '#ff1952' : '#6fc623');
    status.tooltip = `Pomodoro Server on http://...`;
    status.show();
  } else {
    status.hide();
  }
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
  status.hide();
}
exports.deactivate = deactivate;
