# EOT SERVER LIST — V42.6 · Branded Discord Preview

Այս տարբերակը ստեղծված է Discord-ում match-ի preview-ն մաքուր ներկայացնելու համար՝ մեծ վերնագրով միայն `EOT SERVER LIST`։

- `og:title`, `twitter:title` և browser-ի `<title>`-ը՝ միայն `EOT SERVER LIST`։
- `og:site_name`-ը նույնպես EOT SERVER LIST է։ Discord-ը կարող է փոքր աղբյուրի տողը և մեծ վերնագիրը առանձին ցույց տալ։
- Խաղի անունը, ռեժիմը, region-ը, խաղացողների թիվն ու OPEN/CLOSED վիճակը մնում են նկարագրության ու dynamic PNG-ի մեջ։
- Game join redirect-ը և Worker-ի բոլոր endpoint-ները չեն փոխվել։
- Քանի դեռ custom domain չկա, կիսվող հղումի իրական hostname-ը մնում է `eot-preview2.aarayik729.workers.dev`։ Դա Discord-ում metadata-ով թաքցնել չենք կարող։

## Ապահով տեղադրում

1. GitHub `king-community/eot-preview2`-ում backup արա՝ **Code → Download ZIP**։
2. Ամբողջ ZIP-ի փոխարեն ամենաանվտանգը GitHub-ում միայն `src/markup.mjs` ֆայլը փոխարինելն է. `tests/preview.test.mjs`-ը փոփոխված է ստուգման համար։
3. Commit արա փոփոխությունը, Cloudflare Workers & Pages → `eot-preview2` → Deployments-ում սպասիր հաջող տեղադրմանը։
4. Discord-ում փորձարկիր նոր ակտիվ match-ի հղումով։ Նախորդ preview-ները կարող են քեշավորված մնալ։

Այս ZIP-ը Worker-ինն է, **մի վերբեռնիր** հիմնական `eot-server-list` կայքի repository-ում։
