**API Rate Limitter**
Solution to:
Marketo have API Rate Limit of 100calls/20sec.

**Concept**
Leaky Bucket with Redis.

.env
LeakyBucketBackend
- Redis Host

**Work flow**
microservice1 service will be calling the LeakyBucketBackend service , all the marketo operations will be done in LeakyBucketBackend service.

