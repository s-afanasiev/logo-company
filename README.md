1) Клиенту отправляется подготовленная строка в формате base64. Возможно более грамотно было бы использовать ReadableStream - специально разработанный в nestjs для передачи файлов клиенту.

2) Есть, конечно, некоторые нарушения в плане ООП, но почти всё время ушло на гугление вопросов, связанных с поиском библиотеки для конвертации svg в png (была выбрана svg2png-wasm), а также на уточнения по классам Buffer, Uint8Array, кодировке в base64 и других деталей.

3) Запуск приложения:

1. npm i
2. npm run start:dev
3. в браузере localhost:3000
4. в браузере вставляем ссылку в input и нажимаем кнопку. Если у сайта есть элементы с классом или Id равные "logo", то должен отобразиться соответствующий графический артифакт, найденный в пределах элемента "logo".
5. ниже приведены успешные сайты, с которых удалось загрузить логотип.

Используемый SVG-конвертер:

svg2png-wasm
  - https://github.com/ssssota/svg2png-wasm
  - npm install svg2png-wasm
  - This library uses resvg, which is licensed unser MPL-2.0

Рассматривались также: svg-to-png, svgexport, svgpng, convert-svg-to-png

#############

Успешный тест:
https://1000.menu
https://www.russianfood.com/
https://mobilk.ru/
https://htmlbook.ru/
https://iimg.su/

Ничего не найдено:
https://stackoverflow.com/
https://www.deepl.com/
https://gitflic.ru/
https://docs.nestjs.com/
https://rubexgroup.ru/
https://ru.wikipedia.org/
https://rti46.ru
https://www.ozon.ru/
https://www.mvideo.ru/
https://www.vseinstrumenti.ru/
https://price.ru/
https://www.s-fl.ru/
https://skillbox.ru/
https://synergy.ru/
https://habr.com/ru/feed/
https://www.sravni.ru/
https://pikabu.ru/ - SVG data parsing failed cause an unknown namespace prefix 'xlink' at
https://stepik.org/catalog
https://fabricators.ru/

Тестовые картинки jpg или png:
https://base64.guru/MyShowroom/images/products/B07VJWMQ5T/Large.jpg
https://base64.guru/MyShowroom/images/products/B07VJWMQ5T/Large.jpg

Тестовые картинки svg:
https://svgx.ru/svg/295300.svg