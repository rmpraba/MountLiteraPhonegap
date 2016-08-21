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
   var query="SELECT (select pickup_seq from point where id= p.drop_point ) as seq, (select point_name from point where id=p.pickup_point order by pickup_seq)as point, p.student_id,(select student_name from student_details where id=p.student_id and school_id ='"+req.query.schol+"')as name from student_point p  where school_id ='"+req.query.schol+"' and pickup_route_id = (select id from route where route_name = '"+req.query.routeid+"' and school_id ='"+req.query.schol+"') and school_type ='"+req.query.tripid+"' and pickup_route_id not in(select id from route where route_name in (select route_id from attendance where att_date='"+req.query.todate+"' and route_id='"+req.query.routeid+"')) group by pickup_point order by seq";
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
   var query="SELECT (select drop_seq from point where id= p.drop_point ) as seq, (select point_name from point where id= p.drop_point ) as point, p.student_id,(select student_name from student_details where id=p.student_id and school_id ='"+req.query.schol+"')as name from student_point p where school_id ='"+req.query.schol+"' and drop_route_id = (select id from route where route_name = '"+req.query.routeid+"' and school_id ='"+req.query.schol+"') and school_type ='"+req.query.tripid+"' and drop_route_id not in(select id from route where route_name in (select route_id from attendance where att_date='"+req.query.todate+"' and route_id='"+req.query.routeid+"')) group by drop_point order by seq";
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


app.post('/addphoto',  urlencodedParser,function (req, res){
            var data = req.query.x;
            if (data.file) {
                var path = data;
                var file = fs.createWriteStream(path);

                file.on('error', function (err) { 
                    console.error(err) 
                });

                data.file.pipe(file);

                data.file.on('end', function (err) { 
                    var ret = {
                        filename: data.file.hapi.filename,
                        headers: data.file.hapi.headers
                    }
                    res(JSON.stringify(ret));
                })
            

        }
    
});


app.post('/attendancerecord' ,  urlencodedParser,function (req, res)
{
      var collection={"school_id":req.query.schol,"route_id":req.query.routeid,"mode_of_travel":req.query.pickupordrop,"trip":req.query.trip,"att_date":req.query.date,"status":req.query.status};//console.log(schoolx);
      connection.query('insert into att_record set ?',[collection],
        function(err, rows)
        {
      if(!err)
      {
      res.status(200).json({'returnval': 'success'});
      }
      else
      {
      res.status(200).json({'returnval': 'invalid'});
      }
});
  });



app.post('/checkrecord' ,  urlencodedParser,function (req, res)
{
      var schol={"school_id":req.query.schol};
      var route={"route_id":req.query.routeid};
      var mode={"mode_of_travel":req.query.pickupordrop};
      var trip={"trip":req.query.trip};
      var date={"att_date":req.query.date};
      var status={"status":req.query.status};//console.log(schoolx);
      connection.query('select * from att_record where ? and ? and ? and ? and ? and ?',[schol,route,mode,trip,date,status],
        function(err, rows)
        {
      if(!err)
      {
      res.status(200).json({'returnval': 'success'});
      }
      else
      {
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