drop schema if exists ccca cascade;

create schema ccca;

create table ccca.account (
	account_id uuid primary key,
	name text not null,
	email text not null,
	cpf text not null,
	car_plate text null,
	is_passenger boolean not null default false,
	is_driver boolean not null default false,
	password text not null
);

create table ccca.ride (
	ride_id uuid primary key,
	passenger_id uuid,
	driver_id uuid,
	status text,
	fare numeric,
	distance numeric,
	from_lat numeric,
	from_long numeric,
	to_lat numeric,
	to_long numeric,
	date timestamp,
	CONSTRAINT fk_passenger FOREIGN KEY (passenger_id) REFERENCES ccca.account(account_id) ON DELETE CASCADE,
	CONSTRAINT fk_driver FOREIGN KEY (driver_id) REFERENCES ccca.account(account_id) ON DELETE CASCADE
);

create table ccca.position (
	position_id uuid primary key,
	ride_id uuid,
	lat numeric,
	long numeric,
	date timestamp,
	CONSTRAINT fk_ride FOREIGN KEY (ride_id) REFERENCES ccca.ride(ride_id) ON DELETE CASCADE
);