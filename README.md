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
Комманды `install`, `start`, `test` уже встроенны, и позволяют из запускать команду `npm start`, без полного набора на клавиатуре
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

#Практическое использование#
Еще раз. Первое, запуск `npm run command`, запускает связанные  в `package.json` c меткой `command` bash- команды. Второе,
практически все инструменты имеют CLI варианты. Т.е. прописан у нас  `"lint": "jshint **.js"`, запуск `npm run lint` запустит
в bash комманду `jshint **.js`.

Встроенные команды (npm test, npm start, npm stop, npm publish)
- ссылки для самых распростарннеых действий
- стандартный интерфейс для npm ( для тестирования, запуска/остановки проекта).

Запуск `npm run` без аругументов выводит все переопредленные нами встроенные (lifecycle scripts) и наши
кастомные (available via 'npm run-script') комманды.

```
$ npm run
Lifecycle scripts included in npm_test:
  test
    echo "Error: no test specified" && exit 1

available via `npm run-script`:
  build:css
    node-sass ./sass/index.scss | postcss --use autoprefixer > ./build/index.css
  build:js
     browserify -d ./js/app.js  -o ./build/app.js
  build
    npm run build:css && npm run build:js
  preecho
    echo 'preecho!'
  echo
    echo 'test start'
  postecho
    echo 'postecho!'
```

Т.к.`node_modules/.bin` добавляется в `PATH` шела, то и исполняемые файлы (создаваемые пакетами и складывающиеся в 'node_modules')
при `npm install` можно запускать "напрямую", без прописывания полного пути. Не нужно прописывать `"./node_modules/.bin/browserify`, достаточно будет `browserify`.

#Переменные скрипта#
Кроме `PATH`, скриптам достпуно множество переменных. 

```
"scripts": {
    "env": "env"
}
```

Поглядеть можно  создав скрипт `env` и запустив `npm run env`.
Можно перехватить имя исполняемого скрипта, уровень логирования, различные настройки прописанные в `package.json` (обращаясь к ним через `$npm_package_...`)
Символ `--` позволяет передать параметры внутрь пакета.

Для конфигурационных настроек ([Per-Package Config Settings](https://docs.npmjs.com/misc/config#per-package-config-settings))
в `package.json` есть специальная `config` директива.

```
{
  "name": "npm_test",
  "version": "1.0.0",
  "description": "bla-bla-bla",
  "main": "index.js",
  "config":{
    "rootDir": "/"
  },
  "scripts": {
    "ls": " ls /home/user";
    "lsInt": "ls $npm_package_config_rootDir",
    "lsExt": "npm run lsInt --npm_test:rootDir=/home",
    
  }
  
}
```

Запуск скрипта `npm run ls` ожидаемо выводит домашнюю дирректорию в кратком формате.

```
$ npm run ls

> ls /home/koskh

Documents ... Документы...Рабочий стол
```

Используем `--` для  передачи параметра внутрь скрипта. Выводит содержимое домашней дирреткории в расширеном формате 
(включая скрытые файлы/директории).

```
$ npm run ls -- -a

> ls /home/user "-a"

.              .config      .java            .mplayer       ...
..             .dbus        .gconf           .jgoodies      ...
.android       .dmrc        .gitconfig       .kde         .npm ...        
```

Используем "внутренние" настройки пакета`"config":{...}` ( передавая корневую директорию прсмотора), команда выводит содержимое корневой директори.

```
$ npm run lsInt

> npm_test@1.0.0 lsInt npm_scripts
> ls $npm_package_config_rootDir

... bin  boot  cdrom  dev  etc  home  initrd.img   lib  lib32  lib64  ...
```

Используем "внешние" настройки, переопределяя "внутренние", выводит содержимое `home` дирректории.

```
$ npm run lsExt

> npm run lsInt --npm_test:rootDir=/home

> ls $npm_package_config_rootDir

... userName userName2 ...
```

Обратите внимание, шел запускается с правами текущего пользователя. И, так как запускается именно `sh`, он не считывает
ваш `bashrc`, не подхватывает, например, расцветку выводимых файлов.
И алиас `~` нельзя в `config` прописать (может и можно как то хитро, не копался).

# Синтаксис Sh #
```
&& для запуска цепочкой
& для одновременного запуска 
< для  передачи содержимого из файла или команды
> для  передачи содержимого в файла или команду
| для передачи вывода (stdout) одной команды на вход (stdin) другой команды
```
    
Также поддерживается(?) Windows. Для обхода проблем с отсутствующими `rm` используйте пакет [rimraf](https://www.npmjs.org/package/rimraf)
 
# Наш инструментарий #
Что же, давайте попробуем уйти от grunt/gulp.

### Запуск нескольких заданий ###
Для запуска нескольких заданий одной коммандой можно использовать `pre-` и `post-` варианты команды (удобно, когда выполнение
команды требует выполнения предварительных действий, минификаци, например), или можно использовать `&&` или `&` связку.

```
 "dependencies": {
    ...
    "autoprefixer": "^6.0.3",
    "postcss-cli": "^2.1.0",
    ...
  },
"scripts": {
    "lint": "jshint **",
    "build:css": "node-sass ./sass/index.scss | postcss --use autoprefixer > ./build/index.css",
    "build:js": " browserify -d ./js/app.js  -o ./build/app.js",
    "prebuild": "npm run lint",
    "build": "npm run build:css && npm run build:js",
}
```

`npm run build` сначала прогонит проверку lint-ом (prebuild- комманда), затем соберет css, затем js.
Измените `&&` на `&` и собирайте одновременно стили и приложение одновременно. 


### Связывание заданий ###
Одна из  "революционных" фич gulp,  передача потока информации между заданиями через канал, что в отличии от grunt (где все происходит
через сохранение - считывание файлов) позволяет работать быстрее. Ну и прочий рекламный шум...
Тоже мне, новость. Мы тоже так умеем.

```
"build:css": "node-sass ./sass/index.scss | postcss --use autoprefixer > ./build/index.css",
```
Здесь `stdout` команды node-sass передается по  анонимному каналу на вход `postcss`, обработанная информация
дампится в файл `index.css`.

Тa же команда для gulp:
```
gulp.task('sass', function () {
  gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});
gulp.task('css', function () {
    var postcss = require('gulp-postcss');
    return gulp.src('src/**/*.css')
        .pipe( postcss([ require('autoprefixer'), require('cssnano') ]) )
        .pipe( gulp.dest('build/') );
});
```

//TODO: причесать пример сборки css в grunt/gulp

### Версионирование файлов###
Можно связать git  и версионирование файлов.
`npm version patch` изменяет `1.1.1 -> 1.1.2`
`npm version minor` изменяет `1.1.1 -> 1.2.0`
`npm version major` изменяет `1.1.1 -> 2.0.0`
Дополнительно  создаст коммит, тэг. Название тегов, текст коммита настраивается.

### Добавление банера в файл ###

```
{
  "name": "build_by_npm",
  "version": "0.0.1",
  "description": "Description of npm",
  "main": "index.js",
  "config": {
    "banner": "Header_banner_text",
    "dataFormat": "%m/%d/%y_%H:%M:%S_%Z%z"
  },
  "scripts": {
    "add:header": "date '+/* '$npm_package_config_banner' - '$npm_package_name'   - ver.'$npm_package_version' - '$npm_package_config_dataFormat' */' > ./samples/build/index.css",
    "prebuild:css": "npm run add:header",
    "build:css": " node-sass ./samples/style/index.scss >> ./samples/build/index.css"
  }
  ...
```
в `config` прописываем текст банера, формат времени для команды `date`. В скрипте будем обращаться к ним через `$npm_package`.
`prebuild:css` создает строку и дампит (`>`) в файл.
`build:css` дописывает (`>>`) результат своей работы в файл. Можно без `prebuilder-a`

```
"build:css": "npm run add:header && node-sass ./samples/style/index.scss >> ./samples/build/index.css"
```
Другой вариант. более близкий нам по духу:
создаем хелпер `add-banner.js`, в нем так же собираем информацию из `package.json`, как и в предыдущем примере 
(теперь можно и пробелы между словами баннера добавить в конфиг файл). Единственно, v8 не работает `toLocaleString()` 
и на русском дату не получите. Распарсите в хелпере, если критично.

```
'use strict';

var pckgJson = require(process.env.PWD +'/package.json');
var banner = '/* ' + pckgJson.name + ' - '+ pckgJson.config.banner +' - ' + new Date() + ' */\n';

process.stdout.write(banner);
process.stdin.pipe(process.stdout);
```
Прописываем запуск.
```
    "build:css": "node-sass ./samples/style/index.scss | node ./utils/build/add-banner.js > ./samples/build/index.css"
```


### Очистка ###
Практически всегда, билдящие скрипты очищают дирректорию сохранения.
```
"scripts": {
  "clean": "rm -r dist/*"
}
```
в Windows нет `rm`, ииспользуйте пакет `rimraf`
```
"devDependencies": {
  "rimraf": "latest"
},
"scripts": {
  "clean": "rimraf dist"
}
```

###Наблюдение за файлами###
//TODO:Модная тема. но мне без надобности. Дописать, как будет желание. Информацию смотри в блоге-оригинале.

###Запуск файлов, что идут без бинарников###
Иногда полезные утилиты, библиотеки  не поставляют файлы для коммандной строки. Напрмиер, [favicon](https://www.npmjs.org/package/favicons)
И только плагин grunt  позволяет ее использовать. Но, не тут то было. Мы не сдаемся так просто. 
Напишите свою обвязку и запускайте из `npm`
```
// scripts/favicon.js
var favicons = require('favicons');  
var path = require('path');  
favicons({  
    source: path.resolve('../assets/images/logo.png'),
    dest: path.resolve('../dist/'),
});
```

```
"devDependencies": {
  "favicons": "latest",
},
"scripts": {
  "build:favicon": "node scripts/favicon.js",
}
```
//TODO: добавить примеров

###Пример сложного npm- билд скрипта###
[Пример скрипта](https://github.com/keithamus/npm-scripts-example)

### Сборка и минификация CSS###
Будем собирать из sass в один файл,  минифицировать и добавлять баннер в заголовок (с датой- временем компиляции).
[Бенчмарк минификаторов](http://goalsmashers.github.io/css-minification-benchmark/)
Минификатор можно выбрать на свой вкус. В нашем примере, воспользуемся [`csswring`](https://github.com/hail2u/node-csswring). 
Это плагин к PostCSS.
PostCSS позволяет передавать список используемых плагинов и их параметры из config файла, так тто нам не придется писать
в коммандном стиле длинную портянку  параметров.
Для добавления баннеров можно воспользоваться `postcss-banner`. Позволяет добавить баннер в начало или конец файла. Но
не позовляет добавить к тексту баннера время компиляции.

`Config` файл в этом случае выглядел бы так.

```
{
    "use": ["autoprefixer", "csswring", "postcss-banner"],

    "autoprefixer": {
        "browsers": "> 5%"
    },
    "csswring": {
        "removeAllComments": true
    },

    "postcss-banner" : {
        "banner":"banner_text_bla -bla- bla",
        "footer": "footer_banner_text_"
    }

}
```

А строчка в разделе `scripts` для билда css выглядеть будет так:

```
"build:css:minif": " node-sass ./sass/index.scss | postcss --config ./utils/build/config.postcss.json  > ./build/index.css"

```

Но в нашем, конкретном, случае нежелание добавлять даты нас очень печалит, так что мы снова используем свой `add-banner.js`,
убрав из `config.postcss.json` упоминания о `postcss-banner`

```
"build:css:minif": "node-sass ./samples/style/index.scss | postcss --config ./utils/build/config.postcss.json | node ./utils/build/add-banner.js  > ./samples/build/index.css"
```
 
### Сборка и минификация JS ###
Задача  схожа со сборкой css. Сборка в один файл, минификация, соурсмап, баннер с временем компиляции.

Для develop нам достаточно знать, что `browserify` создает встроенный `sourcemap` (ключ `-d`). Поэтому, нам вполне достаточно:
```
"build:js": " browserify -d ./js/app.js   -o ./build/app.js"
```
Для deploy, можно выбрать любой минификатор. Такие минификаторы как `minifyify`, `uglifyify` работают как плагины к `browserify`.
 ```
 "build:js:minifyify": "browserify ./samples/js/app.js  -p [minifyify --no-map]  | node ./utils/build/add-banner.js > ./samples/build/app.js"
 ```
 
### Сборка html файла ###
Наша задача сформировать index.html для spa приложения. В пути к css и js пропишем дополнительный параметр, 
что бы отменить кеширование. Сам index.html (в нашем примере лежит в utils/build) загрузим как шаблон, и подставим 
привильные пути к css и  js файлам, пути к файлам не меняются, меняется только доп. параметр. Путь к шаблону передадим в npm команде.
Шаблон можно ренжерить рендерить силами underscore.template, можно использовать JQuery.tmpl()
В нашем примере будем рендерить с помощью ejs (т.к. он используется далее в node-проекте, и просто, для фана).

Хелпер для сборки index.html

```
'use strict';

var fs =  require ('fs');
var ejs = require('ejs');

var tick = (new Date()).getTime();

var templateFile = process.argv[2];
var template = fs.readFileSync(templateFile,'utf8');

var html = ejs.render(template, {styles:'index.css?v=' + tick, scripts:'app.js?v=' + tick});

process.stdout.write(html);
```
Или вообще, regex-ом можем поменять два текстовых кусочка.

Строка запуска
```
"build:html": "node ./utils/build/build-html ./utils/build/index.html > ./samples/build/index.html"
```

### Запуск одной командой ###
 ```
"build:dev": "npm run build:css && npm run build:js",
"build": "npm run build:css:minifyify && npm run build:js:minifyify"
```

### Deploy ###
[PM2](https://github.com/Unitech/pm2)

[Flightplan](https://github.com/pstadler/flightplan)

[Shipit](https://github.com/shipitjs/shipit)