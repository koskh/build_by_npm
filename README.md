#build_by_npm 
(по мотивам http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/)

#Начало.#
Если в  проекте имеется `package.json`, то очень вероятно, что в него включены скрипты для девелопмента,
тестинга, сборки стилей из less-sass, и прочих полезных ништяков. Обычно, для запуска,  накручивают сверху grunt/gulp с
их огромным количеством плагинов.
Сегодня рассмотрим иной вариант. Вариант, использования  npm напрямую. Без дополнительных помощников. 
Например, вы знаете. что набирая  `npm install `происходит установка модулей, а `npm test` будет
запускать тесты не озадачиваясь, на чем эти тесты написаны. 

В нашем случае, `npm package script` будет фасадом для нашего инструментария. 
Комманды `install`, `start`, `test` уже встроенн, и позволяют из запускать команду `npm start`, без полного набора на клавиатуре
`npm run start`, `npm run stop`и `npm run test`. Доступные встроенные шорткаты [можно поглядеть тут](https://docs.npmjs.com/misc/scripts).
Стоит заметить, что `run publish` относится к публикации проекта в npm репозитории, а не  сборке проекта для  вашего использования. т.е. это не 
`deploy`, хотя некоторые используют слово publish для деплоя своих проектов в grunt/gulp.
Остальные команды мы добавим сами, но для запуска нужно будет набирать `npm run custom_command`.

Для начала "пустой" `package.json`
```
{
    "name": "npm-scripts",
    "dependencies": { ... },
    "devDependencies":{...},
    "scripts": {
        "test":"echo 'test start'!"
    }
}
```

Запускаем npm test, в ответ получаем `эхо`. Теперь, добавим в скрипт пару строчек.
```
 "scripts": {
    "preecho": "echo 'preecho!'",
    "echo": "echo 'test start'",
    "postecho": "echo 'postecho!'"
  }
```
и запускаем `npm start echo`.

```
$npm run echo

> echo 'preecho!'

preecho!

> echo 'test start'

test start

> echo 'postecho!'

postecho!
```

Видите порядок запуска команд?

Фокус в том, что не взирая на метод запуска ( используем уже  встроенный "шорткат", или используем "свою" команду), мы
можем прописать поведение перед запуском и после запуска скрипта, в соответствующих `pre` и `post` коммандах.

Еще пример:
```
"scripts": {
  "prelint": "echo 'covered in lint!'",
  "lint": "echo 'running jslint'",
  "postlint": "echo 'lint-free :)'"
}
```
Выводит:

```
$ npm run lint

> echo 'covered in lint!'
covered in lint!

> echo 'running jshint'
running jslint

> echo 'lint-free :)'
lint-free :)`
```
Такие  pre  и post можно добавить к встроенным `install` или `publish`.

#Область видимости.#
Запуская  скрипты из `package.json`,  мы имеем  доступ к локально установленным пакетам. 

Например, пытаемся запустить grunt обычную программу

```
$ grunt --version
Команда 'grunt' не найдена, возможно вы имели в виду:
 Команда 'grun' из пакета 'grun' (universe)
grunt: команда не найдена
```
Не знает наша система команды `grunt`.
```
{
  "name": "no_-g_for_me",
  "scripts": {
    "grunt": "grunt"
  },
  "devDependencies": {
    "grunt": "^0.4.5",
    "grunt-cli": "^0.1.13"
  }
}
```
пробуем запустить иначе:
```
$ npm run grunt -- --version
> grunt --version

grunt-cli v0.1.13
grunt v0.4.5
```
где `--`символ позволяющий передать аргументы в  скрипт пакета.