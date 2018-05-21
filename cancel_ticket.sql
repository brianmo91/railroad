DELIMITER //
DROP PROCEDURE IF EXISTS cancel_ticket //

create procedure cancel_ticket(IN this_trip_id int)
BEGIN
  declare this_train int;
  declare this_trip_date int;
  declare trip_direction int;
  declare this_start_station int;
  declare this_end_station int;
  declare seg0 int;
  declare seg1 int;

  select trip_train, trip_date, trip_starts, trip_ends
    into this_train, this_trip_date, this_start_station, this_end_station
    from Tickets where trip_id=this_trip_id;

  if this_start_station < this_end_station then
    set trip_direction=0; /*south*/
  else
    set trip_direction=1; /*north*/
  end if;

  /*get start and end segments but store in vars without reference to direction since using 'between'*/
  if trip_direction=0  then
    set seg0=(select segment_id from Segments where segment_north=this_start_station);
    set seg1=(select segment_id from Segments where segment_south=this_end_station);
  else
    set seg0=(select segment_id from Segments where segment_south=this_start_station);
    set seg1=(select segment_id from Segments where segment_north=this_end_station);
  end if;

  /*Increment seats_free*/
  update Seats_Free set sf_seats_free=sf_seats_free+1
    where (sf_seg_id between seg0 and seg1 or sf_seg_id between seg1 and seg0)
    and sf_train_id=this_train and sf_date=this_trip_date;
  /*Mark as cancelled in Tickets*/
  update Tickets set cancelled=1
    where trip_id=this_trip_id;

END//
delimiter ;
