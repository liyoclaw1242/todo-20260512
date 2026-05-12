# Deployment Constraints Snapshot — 2026-05-12

**Project**: Personal todo web app with due-date visual alerts
**Signal**: Issue #3
**Date**: 2026-05-12

## Constraints

- **budget**: free tier (hosting cost = $0/月 目標；paid tier 可接受但需理由)
- **platform**: Mac web browser — Chrome + Safari 正常運作為驗收條件
- **region**: no constraint (Taiwan-accessible 即可)
- **compliance**: none
- **vendor**: open (no vendor lock-in preference; managed services preferred)
- **operations**: managed (liyo 不想維運 infra；serverless / PaaS 優先)

## Notes

- 資料持久化需跨 session：localStorage 可接受最小方案；後端 DB 亦可
- Mobile 非必要（不是驗收條件，不需特別保證）
- 不需要 auth（單人使用）
