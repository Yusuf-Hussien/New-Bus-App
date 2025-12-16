var con=new signalR.HubConnectionBuilder().withUrl("/").withAutomaticUrl().build()

con.start();


con.on("ReceiveLiveLocationFromDriver",(lat,lang)=>{




})