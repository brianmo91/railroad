
DELIMITER //
DROP PROCEDURE IF EXISTS get_ticket //
/* this assumes an auxiliary table avail_trains see schema in separate file*/
/* this uses railroad3 but with an attribute passenger_mop (method of payment) added to passengers and attribute segment_fare added to segments */
/* this procedure outputs a bool trip_still_avail which you reference as @trip_ok when calling the proc to be accessed from session which is 0 if chosen train not still ok, >0 if chosen train is ok*/
/* for instance get_ticket ('Peter','Barnett', 'credit',@trip_ok);   */

create procedure get_ticket(IN pass_fname varchar(30), IN pass_lname varchar(30), IN pay_method varchar(20), address varchar(50), email varchar(50), this_trip_fare decimal(11,2), this_discounttype varchar(100), this_pet tinyint(1), OUT trip_still_avail int)
getting_ticket:  /*label to allow us to leave*/
BEGIN

declare this_train int;
declare this_start_station int;
declare this_end_station int;
declare this_trip_date int;
declare this_passenger int;
declare seg0 int;
declare seg1 int;  /* as in get_available_trains use between seg0 and seg1*/
declare this_start_symbol varchar(4);
declare this_end_symbol varchar(4); /* symbolic names of stations*/
declare chosen_count int;
declare trip_direction tinyint;
declare passenger_exists tinyint; /* your web code must check off customer preference in avail_trains*/
set chosen_count=(select count(*) from avail_trains where chosen=1);
if chosen_count=0   then
set trip_still_avail=2;
/* check this status variable in your prog 0 means no good 1 means good 2 means no selection made*/
leave getting_ticket;
else   /* read info on chosen train into local vars*/
select train_id, start_station, end_station, travel_date  into this_train, this_start_station, this_end_station, this_trip_date from avail_trains where chosen=1;
end if;

/* get direction  -- it is not normal form to store direction in the avail_trains table*/

if this_start_station < this_end_station
then set trip_direction=0; /*south*/
else set trip_direction=1; /*north*/
end if;
/*get start and end segments but store in vars without reference to direction since using 'between'*/
if trip_direction=0  then
set seg0=(select segment_id from Segments where segment_north=this_start_station);
set seg1=(select segment_id from Segments where segment_south=this_end_station);
else
set seg0=(select segment_id from Segments where segment_south=this_start_station);
set seg1=(select segment_id from Segments where segment_north=this_end_station);
end if;

/*use SELECT...FOR UPDATE to lock Seats_free while doing other stuff--new feature needs to be tested*/

set trip_still_avail=(select min(sf_seats_free) from Seats_Free where (sf_train_id=this_train) AND (sf_seg_id between seg0 and seg1 or sf_seg_id between seg1 and seg0) AND (sf_date=this_trip_date));

if trip_still_avail <=0  then
truncate table avail_trains;
select "found no trains and leaving get ticket";
leave getting_ticket;
/* you will have to prompt the customer to start over if no train chosen*/
else /*do other stuff before decrementing seats_free*/
/* get passenger id from name or create passenger */
set passenger_exists=(select count(passenger_id) from Passengers where passenger_lname=pass_lname and passenger_fname=pass_fname and passenger_email=email);
if passenger_exists > 0 then
set this_passenger=(select passenger_id from Passengers where passenger_lname=pass_lname and passenger_fname=pass_fname and passenger_email=email);
else
insert into Passengers (passenger_lname, passenger_fname, passenger_mop,passenger_email,passenger_billing_address) values(pass_lname, pass_fname, pay_method,email,address);
set this_passenger=(select  passenger_id from Passengers  where passenger_lname=pass_lname and passenger_fname=pass_fname and passenger_email=email);
end if;

/* now write ticket*/
insert into Tickets (trip_starts, trip_ends, trip_train, trip_date, passenger_id,fare,discounttype,pet) values (this_start_station, this_end_station, this_train, this_trip_date, this_passenger,this_trip_fare,this_discounttype,this_pet);


/*finally decrement seats_free*/
update Seats_Free set sf_seats_free=sf_seats_free-1 where (sf_seg_id between seg0 and seg1 or sf_seg_id between seg1 and seg0) and sf_train_id=this_train and sf_date=this_trip_date;
truncate table avail_trains;
end if; /*trip still available and have updated passenger and written the ticket*/

END//
delimiter ;
