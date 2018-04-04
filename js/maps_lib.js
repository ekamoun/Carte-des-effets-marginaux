/*!
 * Searchable Map Template with Google Fusion Tables
 * http://derekeder.com/searchable_map_template/
 *
 * Copyright 2012, Derek Eder
 * Licensed under the MIT license.
 * https://github.com/derekeder/FusionTable-Map-Template/wiki/License
 *
 * Date: 12/10/2012
 *
 */

// Enable the visual refresh
google.maps.visualRefresh = true;

var MapsLib = MapsLib || {};
var MapsLib = {

  //Setup section - put your Fusion Table details here
  //Using the v1 Fusion Tables API. See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  //the encrypted Table ID of your Fusion Table (found under File => About)
  //NOTE: numeric IDs will be depricated soon
   fusionTableId:      "1VoeYTNl2AkpV_zTuRezRa3bzU-NXkCnmMRYrbSpl",

  //*New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  //*Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyCdkB06RQcDS8lW9KQaPH38SNBpa6aoJ8g",

  //name of the location column in your Fusion Table.
  //NOTE: if your location column name has spaces in it, surround it with single quotes
  //example: locationColumn:     "'my location'",
  locationColumn:     "Polygone",

  map_centroid:       new google.maps.LatLng(47.8000000, 3.5000000), //center that your map defaults to
  locationScope:      "France",      //geographical area appended to all address searches
  recordName:         "result",       //for showing number of results
  recordNamePlural:   "results",

  searchRadius:       100000000,            //in meters ~ 1/2 mile
  defaultZoom:        8,             //zoom level when map is loaded (bigger is more zoomed in)
  addrMarkerImage:    'images/blue-pushpin.png',
  currentPinpoint:    null,

  initialize: function() {



    $( "#result_count" ).html("");

    geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: MapsLib.defaultZoom,
      center: MapsLib.map_centroid,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map($("#map_canvas")[0],myOptions);
    MapsLib.poly = new google.maps.FusionTablesLayer({
          query: {
            select: 'max_gravit',
            from: '1wrTWE0Wi0GoZ1BJHE6bBkOfUEpwYNMrK3Jvk1O_V',
              }, 
          styles: [{
            markerOptions: {
              iconName: "small_green"
            }
          }, {
            where: 'max_gravit=2',
            markerOptions: {
              iconName: "small_yellow"
            }
          }, {
            where: 'max_gravit=3',
            markerOptions: {
              iconName: "small_red"
            }
          }]
        });

    
    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        MapsLib.calculateCenter();
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(MapsLib.map_centroid);
    });

    MapsLib.searchrecords = null;

    //reset filters
    $("#search_address").val(MapsLib.convertToPlainString($.address.parameter('address')));
    var loadRadius = MapsLib.convertToPlainString($.address.parameter('radius'));
    if (loadRadius != "") $("#search_radius").val(loadRadius);
    else $("#search_radius").val(MapsLib.searchRadius);
   // $(":checkbox").prop("checked", "checked");
    $("#result_box").hide();

    //-----custom initializers-------


    //-----end of custom initializers-------

    //run the default search
    MapsLib.doSearch();

    $('.filter-box').click(function() {
    $('.filter-box').removeClass('active');      
    $(this).addClass('active');
    });
    $("#accordion h3").click(function() {
    $(this).blur();
    });
    $('.radio .label').click(function() {
    $('.radio .label').removeClass('label-actif');      
    $(this).addClass('label-actif');
    });

  
  },

  doSearch: function(location) {

    

/*MapsLib.layer = new google.maps.FusionTablesLayer({
          query: {
            select: 'MJA',
            from: '1pDXxXmvuKCq3SpOsPqawM18fFG4k55CHkeDm9aH2',
              },
          styles: [{
            where: 'MJA<1000',
            polylineOptions: {
              strokeColor: "#00FF33"
            }
          }, {
            where: 'MJA>=1000 ',
            polylineOptions: {
              strokeColor: "#CCFF00"
            }
          },{
            where: 'MJA>=2000',
            polylineOptions: {
              strokeColor: "#FF6699"
            }},
      {
            where: 'MJA>=5000',
            polylineOptions: {
              strokeColor: "#0033CC"
            }},
      {
            where: 'MJA>=10000',
            polylineOptions: {
              strokeColor: "#FF0000"
            }},
      {
            where: 'MJA>=15000',
            polylineOptions: {
              strokeColor: "#000000"
            }}
      
      ]
        
        });*/


    MapsLib.clearSearch();
    var address = $("#search_address").val();
    MapsLib.searchRadius = $("#search_radius").val();

    var whereClause = MapsLib.locationColumn + " not equal to ''";
    
    //-----custom filters-------


  
  
  /* var type_column_atm = "'atmos'";
  if ( $("#atm-tout").is(':checked')) whereClause += " AND " + type_column_atm + " IN('0','1','2','3')";
  if ( $("#atm1").is(':checked')) whereClause += " AND " + type_column_atm + "=0";
  if ( $("#atm2").is(':checked')) whereClause += " AND " + type_column_atm + "IN('1','2')";
  if ( $("#atm3").is(':checked')) whereClause += " AND " + type_column_atm + "=3";  */
  if ( $("#lumiere").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=0.025" ; 
  if ( $("#lumiere").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=-0.002" ; 
  if ( $("#lumiere").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=-0.018" ; 
  if ( $("#lumiere").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=-0.005" ; 
  if ( $("#sexe").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=0.027" ; 
  if ( $("#sexe").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=-0.003" ; 
  if ( $("#sexe").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=-0.019" ; 
  if ( $("#sexe").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=-0.006" ;
  
  if ( $("#atm").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=0.018" ; 
  if ( $("#atm").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=-0.002" ; 
  if ( $("#atm").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=-0.013" ; 
  if ( $("#atm").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=-0.004" ;
  
  if ( $("#agglomeration").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=0.206" ; 
  if ( $("#agglomeration").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=-0.008" ; 
  if ( $("#agglomeration").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=-0.146" ; 
  if ( $("#agglomeration").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=-0.052" ;

  if ( $("#catu").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=0.269" ; 
  if ( $("#catu").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=0.065" ; 
  if ( $("#catu").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=-0.2" ; 
  if ( $("#catu").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=-0.134" ;

  if ( $("#age").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=0.0009" ; 
  if ( $("#age").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=-0.00008" ; 
  if ( $("#age").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=-0.0006" ; 
  if ( $("#age").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=-0.0001" ;

  if ( $("#trajet1").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=-0.069" ; 
  if ( $("#trajet1").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=0.002" ; 
  if ( $("#trajet1").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=0.05" ; 
  if ( $("#trajet1").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=0.017" ;

  if ( $("#trajet2").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=0" ;  
  if ( $("#trajet2").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=-0.082" ;  
  if ( $("#trajet2").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=0.06" ; 
  if ( $("#trajet2").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=0.022" ;

  if ( $("#trajet4").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=0.216" ; 
  if ( $("#trajet4").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=-0.052" ; 
  if ( $("#trajet4").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=-0.134" ; 
  if ( $("#trajet4").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=-0.03" ;

  if ( $("#trajet5").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=-0.082" ; 
  if ( $("#trajet5").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=0.004" ; 
  if ( $("#trajet5").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=0.058" ; 
  if ( $("#trajet5").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=0.019" ;

  if ( $("#catv").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=5" ; 
  if ( $("#catv").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=5" ; 
  if ( $("#catv").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=5" ; 
  if ( $("catv").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=5" ;

  

  if ( $("#weekend").is(':checked') &&  $("#grv1").is(':checked')) whereClause += " AND Effet=5" ; 
  if ( $("#weekend").is(':checked') &&  $("#grv2").is(':checked')) whereClause += " AND Effet=5" ; 
  if ( $("#weekend").is(':checked') &&  $("#grv3").is(':checked')) whereClause += " AND Effet=5" ; 
  if ( $("#weekend").is(':checked') &&  $("#grv4").is(':checked'))  whereClause +=" AND Effet=5" ;

//**/alert($("#lumiere").is(':checked'));
/*  var type_column_traj = "'traj'";
  if ( $("#traj-tout").is(':checked')) whereClause += " AND " + type_column_traj + " IN('0'.'1','2','3','4','5')";
  if ( $("#traj0").is(':checked')) whereClause += " AND " + type_column_traj + "=0";
  if ( $("#traj1").is(':checked')) whereClause += " AND " + type_column_traj + "=1";
  if ( $("#traj2").is(':checked')) whereClause += " AND " + type_column_traj + "=2";
  if ( $("#traj3").is(':checked')) whereClause += " AND " + type_column_traj + "=3";
  if ( $("#traj4").is(':checked')) whereClause += " AND " + type_column_traj + "=4";
  if ( $("#traj5").is(':checked')) whereClause += " AND " + type_column_traj + "=5";*/
  
  
  
/*   var type_column_traj_5 = "'traj5'";
  if ( $("#traj-tout").is(':checked')) whereClause += " AND " + type_column_traj_5 + ">=0";
  if ( $("#traj5").is(':checked')) whereClause += " AND " + type_column_traj_5 + "=1";
  var type_column_traj_1 = "'traj1'";
  if ( $("#traj1").is(':checked')) whereClause += " AND " + type_column_traj_1 + "=1";

  var type_column_traj_2 = "'traj2'";
  if ( $("#traj2").is(':checked')) whereClause += " AND " + type_column_traj_2 + "=1";

  var type_column_traj_3 = "'traj3'";
  if ( $("#traj3").is(':checked')) whereClause += " AND " + type_column_traj_3 + "=1";

  var type_column_traj_4 = "'traj4'";
  if ( $("#traj4").is(':checked')) whereClause += " AND " + type_column_traj_4 + "=1";
  
  
  
    var type_column_catv_5 = "'catv5'";
  if ( $("#catv-tout").is(':checked')) whereClause += " AND " + type_column_catv_5 + ">=0";
  if ( $("#catv5").is(':checked')) whereClause += " AND " + type_column_catv_5 + "=1";
  var type_column_catv_1 = "'catv1'";
  if ( $("#catv1").is(':checked')) whereClause += " AND " + type_column_catv_1 + "=1";

  var type_column_catv_2 = "'catv2'";
  if ( $("#catv2").is(':checked')) whereClause += " AND " + type_column_catv_2 + "=1";

  var type_column_catv_3 = "'catv3'";
  if ( $("#catv3").is(':checked')) whereClause += " AND " + type_column_catv_3 + "=1";

  var type_column_catv_4 = "'catv4'";
  if ( $("#catv4").is(':checked')) whereClause += " AND " + type_column_catv_4 + "=1";
   var type_column_catv_6 = "'catv6'";
  if ( $("#catv6").is(':checked')) whereClause += " AND " + type_column_catv_6 + "=1";
  
  
   var type_column_heure_5 = "'heure5'";
  if ( $("#heure-tout").is(':checked')) whereClause += " AND " + type_column_heure_5 + ">=0";
  if ( $("#heure5").is(':checked')) whereClause += " AND " + type_column_heure_5 + "=1";
  var type_column_heure_1 = "'heure1'";
  if ( $("#heure1").is(':checked')) whereClause += " AND " + type_column_heure_1 + "=1";

  var type_column_heure_2 = "'heure2'";
  if ( $("#heure2").is(':checked')) whereClause += " AND " + type_column_heure_2 + "=1";

  var type_column_heure_3 = "'heure3'";
  if ( $("#heure3").is(':checked')) whereClause += " AND " + type_column_heure_3 + "=1";

  var type_column_heure_4 = "'heure4'";
  if ( $("#heure4").is(':checked')) whereClause += " AND " + type_column_heure_4 + "=1";
  
   var type_column_heure_6 = "'heure6'";
  if ( $("#heure6").is(':checked')) whereClause += " AND " + type_column_heure_6 + "=1";

  var type_column_heure_7 = "'heure7'";
  if ( $("#heure7").is(':checked')) whereClause += " AND " + type_column_heure_7 + "=1";

  var type_column_heure_8 = "'heure8'";
  if ( $("#heure8").is(':checked')) whereClause += " AND " + type_column_heure_ + "=1";
 
/*
  var type_column_nbv = "'nbimpliques'";
  if ( $("#nbv-tout").is(':checked')) whereClause += " AND " + type_column_nbv + ">=0";
  if ( $("#nbv1").is(':checked')) whereClause += " AND " + type_column_nbv + "=1";
  if ( $("#nbv2").is(':checked')) whereClause += " AND " + type_column_nbv + "=2";
  if ( $("#nbv3").is(':checked')) whereClause += " AND " + type_column_nbv + "=3";
  if ( $("#nbv4").is(':checked')) whereClause += " AND " + type_column_nbv + ">3";*/

  /*var type_column_sex = "'sexe'";
  if ( $("#sex-tout").is(':checked')) whereClause += " AND " + type_column_sex + " IN('0','1')";
  if ( $("#sex1").is(':checked')) whereClause += " AND " + type_column_sex + "=0";
  if ( $("#sex2").is(':checked')) whereClause += " AND " + type_column_sex + "=1";

  var type_column_we = "'weekend'";
  if ( $("#we-tout").is(':checked')) whereClause += " AND " + type_column_we + " IN('0','1')";
  if ( $("#we1").is(':checked')) whereClause += " AND " + type_column_we + "=0";
  if ( $("#we2").is(':checked')) whereClause += " AND " + type_column_we + "=1";

 /* var type_column_grv = "'max_gravit'";
  if ( $("#grv-tout").is(':checked')) whereClause += " AND " + type_column_grv + " IN('1','2','3')";
  if ( $("#grv4").is(':checked')) whereClause += " AND " + type_column_grv + "=3";
  if ( $("#grv3").is(':checked')) whereClause += " AND " + type_column_grv + "=2";
 // if ( $("#grv1").is(':checked')) whereClause += " AND " + type_column_grv + "=0";
  if ( $("#grv2").is(':checked')) whereClause += " AND " + type_column_grv + "=1";*/

 /* var open1 = $("#grv2").is(':checked');

      var open2 = $("#grv3").is(':checked');

      var open3 = $("#grv4").is(':checked');
      

      //is open

      var searchOpen = "'max_gravit' IN (-1,";

      if (open1)

        searchOpen += "1,";

      if (open2)

        searchOpen += "2,";

      if (open3)

        searchOpen += "3,";



      whereClause += " AND " + searchOpen.slice(0, searchOpen.length - 1) + ")";*/
  
  
  var type_column_age = "'age'";
  if ( $("#age-tout").is(':checked')) whereClause += " AND " + type_column_age + ">=0";
  if ( $("#age1").is(':checked')) whereClause += " AND " + type_column_age + "<20 " ;
  if ( $("#age2").is(':checked')) whereClause += " AND " + type_column_age + ">=20 AND " + type_column_age + "<40";
  if ( $("#age3").is(':checked')) whereClause += " AND " + type_column_age + ">=40 AND " + type_column_age + "<60";
  if ( $("#age4").is(':checked')) whereClause += " AND " + type_column_age + ">=60 AND " + type_column_age + "<80";
  if ( $("#age5").is(':checked')) whereClause += " AND " + type_column_age + ">=80 " ;
  

  var type_column_age_cond_5 = "'age_cond5'";
  if ( $("#agecond-tout").is(':checked')) whereClause += " AND " + type_column_age_cond_5 + ">=0";
  if ( $("#agecond5").is(':checked')) whereClause += " AND " + type_column_age_cond_5 + "=1";
  var type_column_age_cond_1 = "'age_cond1'";
  if ( $("#agecond1").is(':checked')) whereClause += " AND " + type_column_age_cond_1 + "=1";

  var type_column_age_cond_2 = "'age_cond2'";
  if ( $("#agecond2").is(':checked')) whereClause += " AND " + type_column_age_cond_2 + "=1";

  var type_column_age_cond_3 = "'age_cond3'";
  if ( $("#agecond3").is(':checked')) whereClause += " AND " + type_column_age_cond_3 + "=1";

  var type_column_age_cond_4 = "'age_cond4'";
  if ( $("#agecond4").is(':checked')) whereClause += " AND " + type_column_age_cond_4 + "=1";

  var type_column_sem = "'Jour_semaine'";
  if ( $("#sem-tout").is(':checked')) whereClause += " AND " + type_column_sem + "IN('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche')";
  if ( $("#sem1").is(':checked')) {whereClause = whereClause + " AND " + type_column_sem + "='Lundi'"; }
  if ( $("#sem2").is(':checked')) whereClause += " AND " + type_column_sem + "='Mardi'";
  if ( $("#sem3").is(':checked')) whereClause += " AND " + type_column_sem + "='Mercredi'";
  if ( $("#sem4").is(':checked')) whereClause += " AND " + type_column_sem + "='Jeudi'";
  if ( $("#sem5").is(':checked')) whereClause += " AND " + type_column_sem + "='Vendredi'";
  if ( $("#sem6").is(':checked')) whereClause += " AND " + type_column_sem + "='Samedi'";
  if ( $("#sem7").is(':checked')) whereClause += " AND " + type_column_sem + "='Dimanche'";

    var type_column_mois = "'mois'";
  if ( $("#mois-tout").is(':checked')) whereClause += " AND " + type_column_mois + ">=0";
  if ( $("#mois1").is(':checked')) whereClause += " AND " + type_column_mois + "=1";
  if ( $("#mois2").is(':checked')) whereClause += " AND " + type_column_mois + "=2";
  if ( $("#mois3").is(':checked')) whereClause += " AND " + type_column_mois + "=3";
  if ( $("#mois4").is(':checked')) whereClause += " AND " + type_column_mois + "=4";
  if ( $("#mois5").is(':checked')) whereClause += " AND " + type_column_mois + "=5";
  if ( $("#mois6").is(':checked')) whereClause += " AND " + type_column_mois + "=6";
  if ( $("#mois7").is(':checked')) whereClause += " AND " + type_column_mois + "=7";
  if ( $("#mois8").is(':checked')) whereClause += " AND " + type_column_mois + "=8";
  if ( $("#mois9").is(':checked')) whereClause += " AND " + type_column_mois + "=9";
  if ( $("#mois10").is(':checked')) whereClause += " AND " + type_column_mois + "=10";
  if ( $("#mois11").is(':checked')) whereClause += " AND " + type_column_mois + "=11";
  if ( $("#mois12").is(':checked')) whereClause += " AND " + type_column_mois + "=12";

  var type_column_an = "'an'";
  if ( $("#an-tout").is(':checked')) whereClause += " AND " + type_column_an + ">=0";
  if ( $("#an1").is(':checked')) whereClause += " AND " + type_column_an + "=2005";
  if ( $("#an2").is(':checked')) whereClause += " AND " + type_column_an + "=2006";
  if ( $("#an3").is(':checked')) whereClause += " AND " + type_column_an + "=2007";
  if ( $("#an4").is(':checked')) whereClause += " AND " + type_column_an + "=2008";
  if ( $("#an5").is(':checked')) {whereClause += " AND " + type_column_an + "=2009"; 
        }
  if ( $("#an6").is(':checked')) {whereClause += " AND " + type_column_an + "=2010" ; }
//  else if ($("#an6").not(':checked')) layer.setMap(null); 
  if ( $("#an7").is(':checked')) {whereClause += " AND " + type_column_an + "=2011"; }
  if ( $("#an8").is(':checked')) whereClause += " AND " + type_column_an + "=2012";
  if ( $("#an9").is(':checked')) whereClause += " AND " + type_column_an + "=2013";
  if ( $("#an10").is(':checked')) whereClause += " AND " + type_column_an + "=2014";
  if ( $("#an11").is(':checked')) whereClause += " AND " + type_column_an + "=2015";
  if ( $("#an12").is(':checked')) whereClause += " AND " + type_column_an + "=2016";

 

MapsLib.poly.setMap(map);

    // whereClause += " AND " + searchType_sex.slice(0, searchType_sex.length - 1) + ")";


    //-------end of custom filters--------

    if (address != "") {
      if (address.toLowerCase().indexOf(MapsLib.locationScope) == -1)
        address = address + " " + MapsLib.locationScope;

      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          MapsLib.currentPinpoint = results[0].geometry.location;

          $.address.parameter('address', encodeURIComponent(address));
          $.address.parameter('radius', encodeURIComponent(MapsLib.searchRadius));
          map.setCenter(MapsLib.currentPinpoint);

          // set zoom level based on search radius
          map.setZoom(10);

          // if (MapsLib.searchRadius      >= 1610000) map.setZoom(05); // 1,000 miles
          // else if (MapsLib.searchRadius >= 805000)  map.setZoom(05); // 500 miles
          // else if (MapsLib.searchRadius >= 402500)  map.setZoom(06); // 250 miles
          // else if (MapsLib.searchRadius >= 161000)  map.setZoom(07); // 100 miles
          // else if (MapsLib.searchRadius >= 80500)   map.setZoom(08); // 50 miles
          // else if (MapsLib.searchRadius >= 40250)   map.setZoom(09); // 25 miles
          // else if (MapsLib.searchRadius >= 16100)   map.setZoom(11); // 10 miles
          // else if (MapsLib.searchRadius >= 8050)    map.setZoom(12); // 5 miles
          // else if (MapsLib.searchRadius >= 3220)    map.setZoom(13); // 2 miles
          // else if (MapsLib.searchRadius >= 1610)    map.setZoom(14); // 1 mile
          // else if (MapsLib.searchRadius >= 805)     map.setZoom(15); // 1/2 mile
          // else if (MapsLib.searchRadius >= 400)     map.setZoom(16); // 1/4 mile
          // else                                      map.setZoom(17);

          MapsLib.addrMarker = new google.maps.Marker({
            position: MapsLib.currentPinpoint,
            map: map,
            icon: MapsLib.addrMarkerImage,
            animation: google.maps.Animation.DROP,
            title:address
          });
          
          whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadius + "))";

          MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
          MapsLib.submitSearch(whereClause, map, MapsLib.currentPinpoint);
        }
        else {
          alert("Nous n'avons pas trouvé cette adresse: " + status);
        }
      });
    }
    else { //search without geocoding callback
      MapsLib.submitSearch(whereClause, map);
     // alert(whereClause);
    }
  },

  submitSearch: function(whereClause, map, location) {
    //get using all filters
    //NOTE: styleId and templateId are recently added attributes to load custom marker styles and info windows
    //you can find your Ids inside the link generated by the 'Publish' option in Fusion Tables
    //for more details, see https://developers.google.com/fusiontables/docs/v1/using#WorkingStyles

    MapsLib.searchrecords = new google.maps.FusionTablesLayer({
      query: {
        from:   MapsLib.fusionTableId,
        select: MapsLib.locationColumn,
        where:  whereClause
      },
      styleId: 2,
      templateId: 2
    });
    MapsLib.searchrecords.setMap(map);
    MapsLib.getCount(whereClause);
  },

  clearSearch: function() {
    if (MapsLib.searchrecords != null)
      MapsLib.searchrecords.setMap(null);
    if (MapsLib.addrMarker != null)
      MapsLib.addrMarker.setMap(null);
    if (MapsLib.searchRadiusCircle != null)
      MapsLib.searchRadiusCircle.setMap(null);
     
     //MapsLib.poly.setMap(null);
  },

  findMe: function() {
    // Try W3C Geolocation (Preferred)
    var foundLocation;

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        foundLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        MapsLib.addrFromLatLng(foundLocation);
      }, null);
    }
    else {
      alert("Sorry, we could not find your location.");
    }
  },

  addrFromLatLng: function(latLngPoint) {
    geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $('#search_address').val(results[1].formatted_address);
          $('.hint').focus();
          MapsLib.doSearch();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  },

  drawSearchRadiusCircle: function(point) {
      var circleOptions = {
        strokeColor: "#4b58a6",
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: "#4b58a6",
        fillOpacity: 0.05,
        map: map,
        center: point,
        clickable: false,
        zIndex: -1,
        radius: parseInt(MapsLib.searchRadius)
      };
      MapsLib.searchRadiusCircle = new google.maps.Circle(circleOptions);
  },

  query: function(selectColumns, whereClause, groupBy, orderBy, callback) {
    var queryStr = [];
    queryStr.push("SELECT " + selectColumns);
    queryStr.push(" FROM " + MapsLib.fusionTableId);

    // where, group and order clauses are optional
    if (whereClause != "" && whereClause != null)
      queryStr.push(" WHERE " + whereClause);

    if (groupBy != "" && groupBy != null)
      queryStr.push(" GROUP BY " + groupBy);

     if (orderBy != "" && orderBy != null)
      queryStr.push(" ORDER BY " + orderBy);

    var sql = encodeURIComponent(queryStr.join(" "));
    $.ajax({url: "https://www.googleapis.com/fusiontables/v1/query?sql="+sql+"&callback="+callback+"&key="+MapsLib.googleApiKey, dataType: "jsonp"});
  },

  handleError: function(json) {
    if (json["error"] != undefined) {
      var error = json["error"]["errors"]
      console.log("Error in Fusion Table call!");
      for (var row in error) {
        console.log(" Domain: " + error[row]["domain"]);
        console.log(" Reason: " + error[row]["reason"]);
        console.log(" Message: " + error[row]["message"]);
      }
    }
  },

  getCount: function(whereClause) {
    var selectColumns = "Count()";
    MapsLib.query(selectColumns, whereClause, "", "", "MapsLib.displaySearchCount");
  },

  displaySearchCount: function(json) {
    MapsLib.handleError(json);
    var numRows = 0;
    if (json["rows"] != null)
      numRows = json["rows"][0];

    var name = MapsLib.recordNamePlural;
    if (numRows == 1)
    name = MapsLib.recordName;
    $( "#result_box" ).fadeOut(function() {
        $( "#result_count" ).html(MapsLib.addCommas(numRows) + " " + name + " found");
      });
    $( "#result_box" ).fadeIn();
  },

  addCommas: function(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },

  // maintains map centerpoint for responsive design
  calculateCenter: function() {
    center = map.getCenter();
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
    return decodeURIComponent(text);
  }

  //-----custom functions-------
  // NOTE: if you add custom functions, make sure to append each one with a comma, except for the last one.
  // This also applies to the convertToPlainString function above

  //-----end of custom functions-------
}
