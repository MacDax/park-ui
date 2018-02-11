drop table T_ADDRESS if exists;

create table T_ADDRESS (ID bigint identity primary key, buildingnumber varchar(4) not null, street varchar(80) not null, city varchar(80) not null, zipcode varchar(10));
                        

