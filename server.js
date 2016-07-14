var express    = require("express");
 var mysql      = require('mysql');
 var email   = require("emailjs/email");
 var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'admin',
   database : 'transport'
 });
var bodyParser = require('body-parser');
 var app = express();

app.use(express.static('app'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
   res.sendFile("app/index.html" );
})
app.post('/checkschool-card',  urlencodedParser,function (req, res)
{
  var id={"id":req.query.username};

       connection.query('SELECT name from md_school where id=(select school_id from employee where ?) ',[id],
        function(err, rows)
        {
    if(!err)
    {
    if(rows.length>0)
    {
//console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {

      res.status(200).json({'returnval': 'invalid'});
    }
  }
});
  });


//select the username and password from login table
app.post('/login-card',  urlencodedParser,function (req, res)
{
  var id={"id":req.query.username};
  var username={"id":req.query.username};
    var password={"password":req.query.password};
       connection.query('SELECT role_name,(select school_id from employee where ?) as school,(select name from md_school where id=school) as name ,(select address from md_school where id=school) as addr from role where id=(select role_id from employee where ? and ?) ',[id,username,password],
        function(err, rows)
        {
    if(!err)
    {
    if(rows.length>0)
    {

      res.status(200).json({'returnval': rows});
    }
    else
    {

      res.status(200).json({'returnval': 'invalid'});
    }
  }
});
  });

app.post('/getroute' ,  urlencodedParser,function (req, res)
{
    var schoolx={"school_id":req.query.schol};
    //console.log(schoolx);
      connection.query('select * from route where ?',[schoolx],
        function(err, rows)
        {
        if(!err)
    {
      if(rows.length>0)
      {
        //console.log(rows);
      res.status(200).json({'returnval': rows});
      }
      else
      {
      res.status(200).json({'returnval': 'invalid'});
      }
    }
    else
    {
      console.log('No data Fetched'+err);
    }
});
  });

app.post('/getstudentsforattendancepickup',  urlencodedParser,function (req, res){
   var tripid={"school_type":req.query.tripid};
   var schoolx={"school_id":req.query.schol};
     var route_id={"pickup_route_id":req.query.routeid};
   //console.log(req.query.routeid);
   var query="SELECT (select point_name from point where id=p.pickup_point)as point, p.student_id,(select student_name from student_details where id=p.student_id and school_id ='"+req.query.schol+"')as name from student_point p where school_id ='"+req.query.schol+"' and pickup_route_id = (select id from route where route_name = '"+req.query.routeid+"' and school_id ='"+req.query.schol+"') and school_type ='"+req.query.tripid+"' and pickup_route_id not in(select id from route where route_name in (select route_id from attendance where att_date='"+req.query.todate+"' and route_id='"+req.query.routeid+"')) group by pickup_point";
     //console.log(query);
     connection.query(query,
     function(err, rows){
     if(!err){
       if(rows.length>0){
         //console.log(rows);
         res.status(200).json({'returnval': rows});
       } else {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }
     } else {
       console.log(err);
     }
   });
 });
 
 app.post('/getstudentsforattendancedrop',  urlencodedParser,function (req, res){
   var tripid={"school_type":req.query.tripid};
   var schoolx={"school_id":req.query.schol};
     var route_id={"drop_route_id":req.query.routeid};
   console.log(req.query.routeid);
   var query="SELECT (select point_name from point where id= p.drop_point) as point, p.student_id,(select student_name from student_details where id=p.student_id and school_id ='"+req.query.schol+"')as name from student_point p where school_id ='"+req.query.schol+"' and drop_route_id = (select id from route where route_name = '"+req.query.routeid+"' and school_id ='"+req.query.schol+"') and school_type ='"+req.query.tripid+"' and drop_route_id not in(select id from route where route_name in (select route_id from attendance where att_date='"+req.query.todate+"' and route_id='"+req.query.routeid+"')) group by drop_point";
   connection.query(query,
     function(err, rows){
     if(!err){
       if(rows.length>0){
         //console.log(rows);
         res.status(200).json({'returnval': rows});
       } else {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }
     } else {
       console.log(err);
     }
   });
 });
app.post('/attsubmiturl',  urlencodedParser,function (req, res){
   var collection={"school_id":req.query.schol,"student_id":req.query.studentid,"student_name":req.query.student_name,"route_id":req.query.routeid,"mode_of_travel":req.query.pickupordrop,"trip":req.query.trip,"att_date":req.query.date,"status":req.query.status};
   //console.log(collection);
   connection.query('insert into attendance set ?',[collection],
     function(err, rows){
 
       if(!err)
       {
         res.status(200).json({'returnval': 'success'});
       }
       else
       {
         console.log(err);
         res.status(200).json({'returnval': 'invalid'});
       }
     });
 });







function setvalue(){
  console.log("calling setvalue.....");
}
var server = app.listen(8083, function () {
var host = server.address().address
var port = server.address().port
console.log("Example app listening at http://%s:%s", host, port)
});