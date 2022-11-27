## General Code Review Notes

### Schema design
- It's a good idea to have _all_ tables have `createdAt` and `updatedAt` columns
- I would put all dates in the format `timestamptz` instead of `date`. `timestamptz`. You can read more about this [here](https://medium.com/building-the-system/how-to-store-dates-and-times-in-postgresql-269bda8d6403).
- I'm noticing a lot of repeated columns in different tables. This is a sign that the schema is _denormalized_. Generally, it's a good idea to _normalize_ instead and have information in only one place. There are times where intentional _denormalization_ makes sense... but you should opt into it for reasons. [Here's something I found on the topic](https://vertabelo.com/blog/how-to-remember-database-normal-forms/). Happy to talk through this


### Application
- catching and throwing errors

### Security