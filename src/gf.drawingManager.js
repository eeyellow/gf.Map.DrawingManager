/* GoogleMap數化工具

Author: Ray
Version
    1.0.0   2017-05-24

*/
//需要 jQuery
;(function($, window, document, undefined) {
    //'use strict';
    var pluginName = 'gfMapDrawingManager'; //Plugin名稱

    //建構式
    var DrawingManager = function(element, opt) {
        this.target = element;

        var initResult = this._init(opt); //初始化
        if (initResult) {
            //初始化成功之後的動作
            this._style();
            this._event();
            this._subscribeEvents();

            this.target.trigger('onInitComplete');
        }
    }

    //預設參數
    DrawingManager.options = {
        targetMap: null,
        css: {
            "position": "absolute",
            "top": "0",
            "right": "0",
            "margin": "10px",
            "border-radius": "3px",
            "background-color": "#FFFFFF",
        },
        iconContainerCss: {
            "padding": "5px",
            //"background-color": "#FFFFFF",
            "cursor": "pointer",
            "border-left": "1px solid rgb(221, 221, 221)",
            "width": "28px",
            "height": "28px",
            "text-align": "center",
            "display": "inline-block",
            //"border-radius": "3px 0px 0px 3px"
        },
        iconCss: {
            "width": "16px",
            "height": "16px",
            "position": "relative",
            //top: "2px"
        },
        selectedShape: null,
        //colors: ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'],
        btnArr: [
            {
                mode: "null",
                icon: {
                    inactive: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA3gAAAN4B3eqDagAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKHSURBVFiFxZc9aBRREMd/kxgIGM5CbBQEUYhEJYqYwo9YKAqCjYVaWkhip+BHIcEgiJ2INhERsZKksBAUFYugERELQYIYRIv4gegVQY1BOXUs3uz5cre7t2+zh394zLu5fTP/fbvzf7OoKlkHsBcYA74AL4ELwIKQGHUxA5KfBzRmvAOWNJUAsMtL+Aw4BFwFfpjvTrMJXLdEk0Cr5z/uEVuYh0AL2dBl9pqq/vb8V7z5moyxZiErgXazU75TVadirmkKgaahSAI9IlL6nwROA2UReSoiD0RkSETWNVo0r6Dkn4ES7j3YYL5eoF9E7gHjuPIdUSufKlJKbxHQYfMJXKkdibmux2wbcAIYAc4BL6gXrVFgcaIOAAIcA97bgj/AG2AmiUDKDbQbkUvAfYulwO00AkMxrP1xOLfiwQEvzrY6IRKRVUCf/XwM7AG2A6eAcpYXoQGGge8231z1egwHjN03oK2GfQdwFtiXdwcszk3LMRz5/CpYaXZUVSs+dVWdBk4WsAs/zVZ31NeBabO9ItIvIlJAwlqsNfuk6vG2Zz3uGUUvykOgay5bHvMYo0pYkVQFG/lX8wpUgEGgpQACOy1mObEMPUE5CLz1iNwl53nvxb1ssW6lEqgRkoseiUmgM2fyVpxcKzCQiYC3eD+uNBX4BHTnILDFu5FNQQQsQDfw0QK8BiSQwFESNCbTcayqz4EduDNhuc1DEB3LY1qjMZn7AVUdxzWn4HQ9BKvNPqr9I7QfiLR8t4hMBKxbZnZmrgQizAc6c66dhWY3pTdsJKKoliwOX3HfkuDa+diGNZRApfElVZSAM948fn1gPW8lvWNKG7+ApXUxc6jaIPAhMPkroC8u3l8Ok6p44G/jtQAAAABJRU5ErkJggg==',
                    active: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACFUlEQVR42uWXSyhEURjH75iUxUSSDWWlFGmSsiBRFiM7G6ZsLISyoDwWGmQzC5LXYibKavLKhrzKQsjGQjYisfBK2JDxmDDjf+qbOk1nrnvmPizc+nXm3vOd7/ufc+73nTuKInFFFKUurCh74Bmc4H4cpClWXAg0CiKxQMg12myzg9dwAQ/RtoIZ8EHPNswWMEsCLoGde97NrUaGaQIwwyMKMhgjLJ0TUGnmCpxSkA5BX1RA9b8X0A9S/1IAIwQOwA7wgSKrBNyDd0GdCLMURTsE3MAmEzQTODQIKKE2GfSABQQdQXssKFrbaLPUgtpAF7iJzgBcgLd4AlR8pZAQP9giX8zHmtogn6jccrTr2MZGzk+VyKAAfJPBPqhlhqAPM3kwQABbkSD5GRAZeGifXth+xvQ5gBfU66yoyyRgXiQgQAJWTKwniyRgUtTpp84n0CKVMtoFnFGMBlFnMXjlXpRdkG9gcAeXCbnxjEq5nGd8shcGJBkgwEVb/PibISsoTTC84grIpt7zHj6myN+q5rQBE9xqsI+RvARnb+dS2SM72E2pGa35zgQElHMTKUtkBk6IuKPtOJfNENh3xqsxMk4KuSxxSY4N0Lh1vW/yNM1kLsFvyl69AsZIQJDSVSsh2dNUVYAOLBewRFgvgP1/ZBWUQb8NETAsuQJeInrfpldAhY79/wI5Rpxq7HC6lQzOjuFmkb8fiqZrXVP60KMAAAAASUVORK5CYII='
                }
            },
            {
                mode: "marker",
                icon:  {
                    inactive: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABCAAAAQgBaVp/QgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAIBSURBVFiFrZbPS1RRGIafM46hEihYoC5bCNIkLgJxWbswiAJxYYHbFrboXxDBRS21XKSuwlUggls3bjJowKBQRAgLFKNAaIJx9GsxZ2AY7/3Oj3sPfJv73fd9n3NmzrnHiAi+wxjTDUwBw0AJuA3UgO/AAbAGbIjIhbepiDgLaAdmgFNAHPUDeAkYL2+P8BFg3yO4tT4A1zMBAP3AUUR4o3aB3igAoBPYyRDeqJVYgHc5hDfqXhCAnX3Fw/gzsAmcON7bA4ohAA8dhnPArZZdMuvQPA4BWFKMlpSfbVnRvQ8B+KkY3VcABhXdLxLOhiSTDsdSDigABviraDtaNQWujvOEZ83jmtLrBrpSetUk7ysAUj/HD5WQSaX3SOl9kaRvRMpSviF9GWsk/A+AIeC3onub5zb8AyzaGY8D88A/h+ZBCEAB+OowDKlyzFH8LEeAiRiANqCcQ/g2yt0gFcBCjAGXGcLPgTtqhtb0OF5d9crp7wFwE317pdURWW9ETRDPIwCeeHl7AhSATwHh6z6+3gAW4i5w4RF+DNzIHcBCLHgATAd5BgL02BmmhX/U9nxmAAvxNCX8EhgN9gsVWIitBIDVKK9IgCHqF4xG+BnQF+OVdCNyDhH5BrxuejQrIscxXsbOKFxoTBf1T3YVKIlINcanGJUOiEjFGPMCqMWGA/wHnXeFoNo3dbUAAAAASUVORK5CYII=',
                    active: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABvklEQVR42sWXzStEURjG3zFoSFEorGShLJSFkiU7H/kqO2JL2Sj5AyQWtphZGFayUja2NrPBZMpCUUoNNSJTCvma8VxddZtm3vM511u/Tk3nOc9zztxz7rlECpUlqgazIAxiIJ0hekAbB3tgBATJdmHQMjDnmmUF3IJ5ELBl3gGuJIxz2QdVpuaNmHVSw/wXaM/R1uqaV4ATXXMP27oBtiyY/9GjM/tXiSU+Q3sI7gX9LtGWqgQYFJgvg5acXbIk0IyqBIgwA0UYXZTR7aoEuGMG6mV0rczf8Ch1NqBTSLCUTYw2AF4YbUgmQFAQoJnR1jC6d+ljGh2vmYEWGd0Uo4urPAObzEBf+Z4D/NYGnhhd2OY2TIMNMAwGwCp4E2j6VAKUgAuLJ2FC5yietBhgXCeAsxsSFsxj2ncDCLtBxsD8E7Sb3gmiBgHWbNyI6gXbq9DRmzS+EXlCzGjMfszmpdTZlqcKsz8oxs24E3xLBEiBOipGYeB1iQDTVKxy33YpZumPrX0PMCEmCgRwzosu8qMw06M8AXbIr3JfvR+epX9G20B+FgxXPLNfIL8LppXgxv1uLKf/KBgPgX6TMX4ArstZcDqK0HYAAAAASUVORK5CYII='
                }
            },
            {
                mode: "polyline",
                icon:  {
                    inactive: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACPVBMVEUDAAAEAAD///8AAAAEAAAAAAAAAAAAAAADAAAAAAADAAAEAAAAAAADAAAAAAADAAAEAAAAAAAEAAADAAAEAAAAAAADAAAAAAADAAAEAAAAAAADAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAADAAAEAAADAAAEAAADAAAEAAAAAAAEAAAEAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAEAAADAAAAAAADAAADAAAAAAAAAAAAAAAAAAADAAAEAAAEAAAAAAAEAAADAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAADAAAAAAAEAAADAAAEAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAADAAAAAAADAAAEAAAEAAADAAAEAAAAAAAAAAAAAAADAAADAAAEAAADAAAEAAADAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAEAAAAAAACAAADAAAEAAAAAAAAAAAEAAAEAAADAAAAAAAEAAAAAAAAAAAAAAAAAAADAAAEAAADAAAEAAAAAAAAAAAAAAAEAAADAAAEAAAAAAADAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAEAAADAAAAAAADAAAEAAAEAAAAAAAAAAADAAAAAAAAAAABAAADAAAEAACZlDwkAAAAu3RSTlMAAAABAQIDBAQFBQUGBgcHBwgICQkKCgsMDA0NDQ4QEhUWFxkbHB8gISIjIyQkJSUmJigoKSoqKywvNTc5OTo7Oz1AQEVHSlBVVlZXWVlaYGFkZmhpa29vcHJzdXV4eXx9gIGEh4uOj5CQkJGSkpSVlpqbm5ycnZ2fpKWnqqyur7CytLi5vcDBw8TFxcXGx8fJysvLzdDS09PT1NTV19nb3OPl5ebp6eru7/Hy8/T19/f3+fr6+vv8/f3+ZYoTbAAAAdhJREFUeAF9z4dzTFEUBvBzb0SJVSQ6y0YUgogSvZdN9F4kohcJIcgqokQvUUTvZa0i0QvLdb6/zTH73jP7iu/O3Dln7m/unENaokiOIqLWG88OJymVdpIG2lUw7g0JBlnbwMDdwkBQARbAD0YHgB1gXFrwjHF/lC+oYnD9MJr6XP4Y6QUtqwBcK5Rqxjfgqge0r2RGg7yTWgnGTjfIqmRwQwEJKAXz3hwXaCb78Y3BJGANA7HO5AKyH+qH/t207Ccj1pPc4Cv4fIESUCYDHuimPOAz8yIiUqXfGTXZygs+gp9MkvkY2NdG+YBPYDydtgpALJt8AQN4KdeejioAMBjg/V2VLyhJvaOmB/mC6W9/X5w/e87cmTnkD2YZU9tJ2+ngVA7IO2SWOn1utMQDdNTMs9vM8kTTii4RF+hrtqaajAHFCZN89WLL7qIpurccC7R9V9dCS0LjqhONR+tOHPkS/3DmyupNF8ZaQD+81UvuPkse/To5MXeMzh+0bu3j28aYwzY4/qafbjX5srm+PKytRMaXv35/zAIZm5P5A2vj8V0juut/CUU3FFlAL/xx8HTjueL+Oi0hZ4vMU8bcXD9Be2KD8B3TtEzrYNB8cfX28H+AJC+ig/IHp5CnL3qRwHQAAAAASUVORK5CYII=',
                    active: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACh0lEQVR42r2XTUhVQRTHJ6uXfUkEGlJQaUZl0CqkInATgas2FbZSiChaGImgUJAQtAjKolr0QZsiiMiIFrUIijLJCKIPImoXL7BFYR9I6vP2O3iEYZjnvXrnvgs/7rx5583/P/ecmTfXmBlckTFzR43pHjPmCe21ppQXgvMQ70E8Ut7Rt6ZU4jLzs5a4bSL7J+HM3OU9JjZkKX7OEeyDffR/dUysz0L8vCuOUJ2mZRuf846JdaFyPscj/tLNN58b6R+xYvqzqHZhwFdsBWPa7DgxHaLafeJ1biz97U7cFeLmpxGf5Vlqr+iv9Yh3ODO/StyC0Eutz7fRqHjBEV+cOvdOMT0r8tg77DjErxG3KEjlM+A/y0BrkZyPOjMvD7bmGXTYGvwzg2+JKbhc0E3HNqAmviCynfYRT8GVB9/1XAPKoCN+OdVSm4GBKJOC8+wBu2PEwyy1IuKN48b85h5FE/90zbBH2UvfjsweuxrYqeIRRm4l3dGCFSIDVcMNNXEw4W+qoElSF8pEkxpoThBbBp08rW/wi3YbLITKNAaWq4EzU/1ZwSrYJeIaX6D9nfsgnIaLcjyTw4r+Zql9n/IMwEB/4J4cRjzf52ATXNKZD9G+I/Fwn/ZtGIE8DMNj6IejcBKew8Y4Ex8Y7A33JU7/MjjAdx+5j8MD2aa1Duo1phZq4Bh0EfsJ3k4Wt3IzzkAv/IQVk4cT2MpAL3QAORschooEKa2EzVIr8AP+wl0Tk99TklOdzWpdknnlghw4p7sZaeqkwE/EHt0JaIExuI74I83zUyk6WJmiwHNJgsoQfGjl6zUch4ZSvXpVRBOvWZGu7UOlfvGcDftlmUFPkkLLykh1qh1tGtd/lYIlMM+FrhMAAAAASUVORK5CYII='
                }
            },
            {
                mode: "polygon",
                icon:  {
                    inactive: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACDVBMVEUDAAAEAAD///8EAAADAAAEAAADAAADAAAEAAADAAADAAAEAAADAAAEAAADAAADAAAEAAADAAAEAAAEAAADAAAEAAADAAADAAAEAAADAAADAAADAAADAAAEAAAEAAAEAAAEAAADAAAEAAADAAAEAAAEAAADAAAEAAAEAAAEAAADAAADAAAEAAAEAAAEAAAEAAADAAAEAAADAAAEAAADAAADAAAEAAADAAADAAADAAAEAAAEAAADAAAEAAAEAAADAAAEAAADAAADAAAEAAADAAADAAADAAAEAAAEAAAEAAAEAAAEAAADAAAEAAADAAADAAAEAAAEAAADAAAEAAADAAAEAAADAAAEAAADAAADAAAEAAADAAAEAAADAAADAAAEAAAEAAADAAADAAADAAAEAAAEAAAEAAAEAAADAAAEAAADAAAEAAADAAADAAAEAAAEAAAEAAADAAAEAAAEAAADAAAEAAAEAAAEAAAEAAADAAAEAAAEAAADAAAEAAAEAAAEAAAEAAAEAAADAAAEAAAEAAADAAAEAAADAAADAAAEAAAEAAAEAAAEAAADAAAEAAADAAAEAAADAAAEAAAEAAADAAAEAAAEAAAEAAAEAAADAAAEAAAEAAADAAAEAAAEAAAEAAADAAAEAAADAAADAAAEAAADAAAEAAADAAAEAAADAAAEAAADAAAEAAADAAAEAACOnWCEAAAArXRSTlMAAAABAgIDBAQFBgYHCQoLCwwMDxAREhMTFhcYGxscHSEjIyQnKisrLTIzNjY3ODk+P0FBRUhISUtMTE5QUlRVV1pbW1xdYGJjZmhpa2xucHBydXd4eHl6fH1+gISGh4uOkJGTk5eYmZyeoaSlp6ipra6vsLGytLi5urq8vb7AwcbJy8zS09PW19jb3N3e3t/f4ODh4+fo6uvt7e7w8PHy8/X29/f4+fr7/Pz9/h9MGKMAAAHSSURBVHgBhdP3UxNRFMXxczZYjCKIMVjEXrBgx94LFgV7L4q9KPYiAvZCiR2L2BWRyL1/o5N1r7svMwzfyWTmZT5zsj/sg9dFPiBB+l8oqV3x74RM/wEYfOa+VdlEmHFAprW/RFQOEPB/YQh8wj0iZxd8VT2dH4wY8DVzj4tWel7xU5Hqge4CSLLwssiWzClZp3p/JAkiXCBG3dP2Ms8vflIkNcn5C6DkmXyf7VnlaWmZ74CFH/T9ZC+s9JO0lkXAuh/6aowXbXSDyjYDPKT6oAieU7JG9bCBqt8PkzRgda/SzwaWN53pFgKrWs4HIDZFa/OQDYamdZUtjE/rcDILbJd3gwyMa2pZzOyFejnFAGBETUdFNpiqugi2EL8hO3rQBSe0OWEAuChH+7kg96McAw3kVGpdPhywVDtKaYA9y/U53YWb+iIvXMAybRjigKJ2OULCFrCkrXmWAyr0z0wiBHPeyMrgxSdjiekHt95ujEdB8RNdHSMIFM7YeeHxF9E7uwCGz5BI6ZocDp6391L9T02/vr572gBEbhZZ8Ej277uWatX0yyubJ/YiQEYB+l/9JtLWeG7DhD52DaMAKNh499b6sb0JBoFwFth3GNnZ7e6iv9wHd4PIjOXmAAAAAElFTkSuQmCC',
                    active: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAClElEQVR42t2XTUhVURDHj2ZGJfTyQQnZIgyCwk1CH5vCRWAkEVIEWRAFURQigmSR0iJqEUThwoIIgsJapBUtSkpsE0StCirQ1GhhJIoZ+a2v34m5MAt79+u8JC/8ufeeN//5z5kzc859xvzPV8qYzVPGtIPKuRDfNWnMd8RTgup/Jo7YMTCuxP+AgC5lXHzamAYlehfR3eCnGrtNdpZmIuWLEbquZntV/VbMWLcKoo2xpEvxJIIPlUDtLDb5jHcom7eMFbkQL8LZG3E6BQ6nsc0l0JsqiG7GNsVqMxz2iLMRnssCFukpCdbyBuGVRxHfA3FA1nsg7EywL4M7JEGMpcvcbDM4DkZF/AvO1kXM4Fr4nd6S0EF1viQIV9QavsPJqpg1ZIvzheqea36zvwcmwXtLdtRFC8SvDeCHXwCVGH3mfgditsPds02ycD9dpFlgixi2u9rR7DKqrjjkZ7zBM+Z5taPtu07S34/PFb4ByBIMgr0uAsDfJ5n9rSDpWiNVOwOqHKR/q+qqiiCEXAyfSd+e4T0n5uxvSPr78JUIWrEtQmqElBfnBPV2Q3w1BSVl26NWUtYRpxPg7xc/M6mA54gNIEcOExt1j4vex09vqIlAOiDETogFcXvfLmVY8j6IE1I4OyLOvkrSP42f0rAB7IT0TRwcDMixu2gCbId7mQ46Dfclz122s8IGUAzxowRwxDr/26caKEXsLHYP4HwAw6rvX/HbuSjrl1AfmUe9Q4n7SlCOyHnGW2WHG/U+13j/yv0povXYbQPLo/Zvnj2OpYAuggs8P5GgxpRgL/dHoAZOCVjo6it4GU4fI/BLpdMWZRdoZoYnsdkIFmXqb5fNQDV4DZ6DE4ytD11MMYNYAgrNfL9+A8BUt252yyGMAAAAAElFTkSuQmCC'
                }
            },
            {
                mode: "rectangle",
                icon:  {
                    inactive: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAn1BMVEUDAAAEAAD///8EAAADAAADAAAEAAAEAAADAAAEAAAEAAADAAAEAAAEAAAEAAAEAAAEAAADAAAEAAADAAADAAAEAAAEAAAEAAADAAAEAAAEAAADAAAEAAADAAADAAAEAAADAAAEAAADAAAEAAAEAAAEAAADAAAEAAADAAAEAAAEAAADAAADAAAEAAAEAAADAAAEAAAEAAAEAAADAAAEAADGEKmeAAAANXRSTlMAAABGR1FXWFlZYmRkZaCio6Skpaqqtbm9vcDCy9DW1tfX3d3f4OHh4uLl5+jo7e/v8vX39xszZnMAAADeSURBVDjL1ZO7TgNBDEXPGVkBiSIdz///rhQUdEgIiQhC9lLMKg/tLumQmOZq7GuPfe2x8fu55P8LQt1XkxiBIDEgBCD7l7rdbU072IVgTIuwWr3Wdv9cwUjGTAEkMuRubfm++14gwMfasrlUX1AaITjvR1LIQore15IO6VG6ROj+JO3MMOVZJDOUHLDlxBYDeEI1dbxn5oVYR1GmNRI56OhEpQ6VZLkJTPXJLEhNaGdFT7SSNuzn4wH9GlrdXH82+x4YM46or+DweDX49MC4J0Ls/Y4Y3zb+h591kfADcitjfgs22T8AAAAASUVORK5CYII=',
                    active: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAArklEQVR42u2WuwrCQBBF79fF2kptRf9LjDb2FhaC2NpYxUpiBImNCIJYGIhnxco+s4Jz4WQ228xhH7CSxxM7lbR6ShnsDMnou6EmQeDKoIS9IcfQF/rip4C8ltpM9BqmCx3Y0vNMHehjszDe9um3wNJSgNWeRRWoXCC2QO0Cfy/gh9AFfk6gYDA3vgWj8AiiDoPADS4wZmJiQAon+t3fK8BnDQ9rEDiwFS1/lXs8L4Qum0VYDTMSAAAAAElFTkSuQmCC'
                }
            },
            {
                mode: "circle",
                icon:  {
                    inactive: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMThweCIgaGVpZ2h0PSIxOHB4IiB2aWV3Qm94PSIwIDAgMTggMTgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQ2ICg0NDQyMykgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+VW50aXRsZWQ8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsIiBzdHJva2U9IiMwMDAwMDAiIGN4PSI5IiBjeT0iOSIgcj0iOCI+PC9jaXJjbGU+CiAgICAgICAgPHBhdGggZD0iTTkuNSw5LjUgTDE0LjUsMy41IiBpZD0iTGluZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIj48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg==',
                    active: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMThweCIgaGVpZ2h0PSIxOHB4IiB2aWV3Qm94PSIwIDAgMTggMTgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQ2ICg0NDQyMykgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+VW50aXRsZWQ8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsIiBzdHJva2U9IiNGRjAwMDAiIGN4PSI5IiBjeT0iOSIgcj0iOCI+PC9jaXJjbGU+CiAgICAgICAgPHBhdGggZD0iTTkuNSw5LjUgTDE0LjUsMy41IiBpZD0iTGluZSIgc3Ryb2tlPSIjRkYwMDAwIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIj48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg=='
                }
            },
            {
                mode: "delete",
                icon:  {
                    inactive: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABAAAAAQABTdB3JwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAJASURBVFiF7Za/a1RBEMc/c54arURtIqeCRAV/IScWIvgD/wGxERTEQq3EysLCIqWKWKSwMSA2NlqJIKRRNAZJDHediIc2CgpGAxo4iPq1ePu8zbp3L9575poMDLvzfTO73/fe7OyYJLLEzJrA8g4u+yS9yFwoIqVugoqUsm+Y2QHipFLsGvDOw28AK4CqmfVF4uqSpjsykPRHgSagAvWQv35Me/4LFgmUA3sjYAWu/yXLweZTB/6nhF8AMzsHnPCghqQzZrYMGAncL0sabRfTFQFgE3DQs1e5sRTgAGszYjKl50m4SKDnBGJJmEcmgFfA+EITeAAMS2r8a2AhBCSNpXMzqwBVkipYkzSTFRxeyVeYe6XWHd4X4FNAv3u2BLgEfAp8fpL8jr3truM8BI47fAPwnM59wSwwWCSBuw4rAWPBG4eb+9jpoggMOOyihz0DtgNvPewmcASYcfY0UMlL4LPn+9FhP4DNDlsPNNzm6W171VtvMC+BR86uBH6vgXXu2Rpv85OOYOr3MG9POOHGaoBvAZ6Y2WpJU5JkZseAOySnhFhcNwRWujHW7YwAXz17nLlt/F9x3RDY5sY68MvDhySdT9/czCqS3gOHSXIilcm8BHaamUn67khActTuA5jZKeAe8NhVxQ/AqBfvz7s+hkcdtp/WOf9Gku3+uX8D3PbsSaBcRB2o0cry64F/O20CO+ZTiPqB3Z5udbgF+FIPv0Cr2MS0BuyKleLC2nIzGwDOAnto3YYvgafALUmzsbjfaRxIOyOSapMAAAAASUVORK5CYII=',
                    active: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABw0lEQVR42mNgIAL8Z2D4AcT/8WALBloCujkAaJAdEDtgwb+gFnUCcQYS/gYVz8KhT4DaPiUVO4w6YMg5QByIJaiI2RiGHAC6Og2IDyDhOVBxNjRxELbBp4dcB3Qgx+M/BoYLUHEOLHEcgE/PqANGHTAQDjgFxAuBOJveDrACYhVqlQMkOwBNvwwQ+4HKCCDmpqUD3gKxJFSOGYgrgPglmpq/0GgxpYUDwqHickB8lECl9BuIG6jpgGVQMSag/DE0H//HEgowdgK1HKACFStBUncYSGsD8T0kddOA2BmIv0L5H0BphCIHAPlvkNS+gKr7A8SqUDFZoJo7UMsZoWKdSGY2UOqA7UipHVndTSAtBZUTRrI8GupAmNotlEZBE5TvhyW+bwGxEJJZQWiWg8x7RqkDeqB8GywOmALzOVIo3UYz7wqlDtgG5fOgpfCJaD6XweGIhZSmgcdI8XsWKRHaQsXioA67DbWcEYjnI5mZSo1sCKsDrGGhAFT3GZrakUPlNprlIAezUMMB55FCoYfIJjqoya9DTEEkCcQGSFgdKs6IJs6KJJ6HVNhgwyAH69G6Na0CjYI9QPwOWhitgHZcWXHpAwCI8NfGybKEYQAAAABJRU5ErkJggg=='
                }
            },
        ],
        markerIcon: {
            default: "data:image/png;base64,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",
            active: "data:image/png;base64,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"
        },
        //selectedColor: null,
        colorButtons: {},
        drawingManager: null,
        drawingManagerContainer: null,
        shapePool: [],
        polygonOptions: {
            strokeWeight: 0,
            fillOpacity: 0.45,
            fillColor: '#1E90FF',
            editable: false,
            draggable: true
        },
        polylineOptions: {
            geodesic: true,
            strokeWeight: 3,
            strokeColor: '#1E90FF',
            strokeOpacity: 1,
            editable: false,
            draggable: true
        },
        markerOptions: {
            draggable: true
        },
        readonly: false,
        //mode: ["null", "marker", "polyline", "polygon", "rectangle", "delete"],
        onInitComplete: undefined,
        //onLocateClearComplete: undefined
    }

    //私有方法
    DrawingManager.prototype = {
        //初始化
        _init: function(_opt) {
            //合併自訂參數與預設參數
            try {
                this.options = $.extend(true, {}, DrawingManager.options, _opt);
                return true;
            } catch (ex) {
                return false;
            }
        },
        //樣式
        _style: function() {
            var oCom = this;
            oCom.target
                .css(oCom.options.css);
            var html = "";
            oCom.options.btnArr.forEach(function(ele) {
                if(oCom.options.mode == undefined || oCom.options.mode.indexOf(ele.mode) >= 0){
                    html +=
                    "<span data-drawmode='" + ele.mode + "'>" +
                        "<img class='inactive' src='" + ele.icon.inactive + "' style='' />" +
                    "</span>";
                }
            });
            oCom.target
                .append(html)
                .find('span')
                    .css(oCom.options.iconContainerCss)
                    .first()
                        .css("border-left", "none")
                        .end()
                    .end()
                .find('img')
                    .css(oCom.options.iconCss)
                    .end()
        },
        //綁定事件
        _event: function() {
            var oCom = this;

            if(oCom.options.readonly){
                //唯讀模式
                oCom.target.hide();

                oCom.options.markerOptions.draggable = false;
                oCom.options.polylineOptions.draggable = false;
                oCom.options.polygonOptions.draggable = false;
            }

            oCom.options.drawingManager = new google.maps.drawing.DrawingManager({
                map: oCom.options.targetMap,
                drawingMode: null,
                drawingControl: false,
                drawingControlOptions: {
                    drawingModes: [
                        google.maps.drawing.OverlayType.MARKER,
                        google.maps.drawing.OverlayType.POLYGON,
                        google.maps.drawing.OverlayType.POLYLINE,
                        google.maps.drawing.OverlayType.CIRCLE,
                        google.maps.drawing.OverlayType.RECTANGLE
                    ]
                },
                markerOptions: {
                    draggable: true
                },
                polylineOptions: {
                    editable: true,
                    draggable: true
                },
                rectangleOptions: oCom.options.polygonOptions,
                circleOptions: oCom.options.polygonOptions,
                polygonOptions: oCom.options.polygonOptions
            });
            oCom.target.find('span').each(function(s){
                oCom._setDrawingMode("null");
                $(this).click(function(){
                    oCom._setDrawingMode($(this).data().drawmode);
                })
            });

            google.maps.event.addListener(oCom.options.drawingManager, 'overlaycomplete', function(e) {
                var newShape = e.overlay;
                newShape.type = e.type;
                newShape.id = oCom.options.shapePool.length;
                if (e.type !== google.maps.drawing.OverlayType.MARKER) {
                    // Switch back to non-drawing mode after drawing a shape.
                    //drawingManager._setDrawingMode(null);
                    oCom._setDrawingMode("null")

                    // Add an event listener that selects the newly-drawn shape when the user
                    // mouses down on it.
                    google.maps.event.addListener(newShape, 'click', function(e) {
                        if (e.vertex !== undefined) {
                            if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
                                var path = newShape.getPaths().getAt(e.path);
                                path.removeAt(e.vertex);
                                if (path.length < 3) {
                                    newShape.setMap(null);
                                }
                            }
                            if (newShape.type === google.maps.drawing.OverlayType.POLYLINE) {
                                var path = newShape.getPath();
                                path.removeAt(e.vertex);
                                if (path.length < 2) {
                                    newShape.setMap(null);
                                }
                            }
                        }
                        oCom._setSelection(newShape);
                    });
                    oCom._setSelection(newShape);
                } else {
                    google.maps.event.addListener(newShape, 'click', function(e) {
                        oCom._setSelection(newShape);
                    });
                    oCom._setSelection(newShape);
                }

                oCom.options.shapePool.push({
                    shape: newShape,
                    type: e.type,
                    id: oCom.options.shapePool.length
                });
            });

            google.maps.event.addListener(oCom.options.drawingManager, 'drawingmode_changed', function(){
                oCom._clearSelection();
            });

            google.maps.event.addListener(oCom.options.targetMap, 'click', function(){
                oCom._clearSelection();
            });

            google.maps.Map.prototype.getGeoJson = function(dataset, callback) {
                var geo = {
                    "type": "FeatureCollection",
                    "features": []
                };
                var fx = function(g, t) {
                    var that = [],
                        arr,
                        f = {
                            MultiLineString: 'LineString',
                            LineString: 'Point',
                            MultiPolygon: 'Polygon',
                            Polygon: 'LinearRing',
                            LinearRing: 'Point',
                            MultiPoint: 'Point'
                        };

                    switch (t) {
                        case 'Point':
                            g = (g.get) ? g.get() : g;
                            return ([g.lng(), g.lat()]);
                            break;
                        default:
                            arr = g.getArray();
                            for (var i = 0; i < arr.length; ++i) {
                                that.push(fx(arr[i], f[t]));
                            }
                            if (t == 'LinearRing' &&
                                that[0] !== that[that.length - 1]) {
                                that.push([that[0][0], that[0][1]]);
                            }
                            return that;
                    }
                };

                var targetData;
                if(dataset == undefined){
                    targetData = this.data;
                }
                else{
                    targetData = dataset;
                }
                targetData.forEach(function(feature) {
                    var _feature = {
                        type: 'Feature',
                        properties: {}
                    }
                    _id = feature.getId(),
                        _geometry = feature.getGeometry(),
                        _type = _geometry.getType(),
                        _coordinates = fx(_geometry, _type);

                    _feature.geometry = {
                        type: _type,
                        coordinates: _coordinates
                    };
                    if (typeof _id === 'string') {
                        _feature.id = _id;
                    }

                    geo.features.push(_feature);
                    feature.forEachProperty(function(v, k) {
                        _feature.properties[k] = v;
                    });
                });
                if (typeof callback === 'function') {
                    callback(geo);
                }
                return geo;
            }


        },
        //取消選取目前所選的物件
        _clearSelection: function() {
            var oCom = this;
            if (oCom.options.selectedShape) {
                if (oCom.options.selectedShape.type == 'marker') {
                    oCom.options.selectedShape.setIcon(oCom.options.markerIcon.default);
                } else {
                    oCom.options.selectedShape.setEditable(false);
                    oCom.options.selectedShape.setOptions({
                        strokeColor: '#1E90FF',
                        fillColor: '#1E90FF'
                    });
                }

                oCom.options.selectedShape = null;
            }
        },
        //清除所有物件
        _clear: function(){
            var oCom = this;

            oCom.options.shapePool.forEach(function(ele){
                if(ele != undefined)
                {
                    ele.shape.setMap(null);
                    ele = null;
                }
            });
            oCom.options.shapePool = [];

            oCom.options.selectedShape = null;

            oCom._setDrawingMode("null");
        },
        //設定目前所選物件的樣式
        _setSelection: function(shape) {
            var oCom = this;
            oCom._clearSelection();
            if (shape.type == 'marker') {
                shape.setIcon(oCom.options.markerIcon.active);
            } else {                
                shape.setEditable(true);
                //_selectColor(shape.get('fillColor') || shape.get('strokeColor'));
                shape.setOptions({
                    strokeColor: '#FF1493',
                    fillColor: '#FF1493'
                });
            }

            oCom.options.selectedShape = shape;
        },
        //取得目前所選物件
        _getSelection: function() {
            var oCom = this;
            return oCom.options.selectedShape;
        },
        //刪除目前所選物件
        _deleteSelectedShape: function() {
            var oCom = this;
            if (oCom.options.selectedShape) {
                oCom.options.selectedShape.setMap(null);
            }

            for (var i = 0; i < oCom.options.shapePool.length; i++) {
                if (oCom.options.shapePool[i] != undefined && oCom.options.shapePool[i].id == oCom.options.selectedShape.id) {
                    oCom.options.shapePool[i] = null;
                }
            }
        },
        //<!--Deprecate->
        _selectColor: function(color) {
            var oCom = this;
            oCom.options.selectedColor = color;
            for (var i = 0; i < colors.length; ++i) {
                var currColor = colors[i];
                oCom.optionscolorButtons[currColor].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
            }

            // Retrieves the current options from the drawing manager and replaces the
            // stroke or fill color as appropriate.
            var polylineOptions = oCom.options.drawingManager.get('polylineOptions');
            polylineOptions.strokeColor = color;
            oCom.options.drawingManager.set('polylineOptions', polylineOptions);

            var rectangleOptions = oCom.options.drawingManager.get('rectangleOptions');
            rectangleOptions.fillColor = color;
            oCom.options.drawingManager.set('rectangleOptions', rectangleOptions);

            var circleOptions = oCom.options.drawingManager.get('circleOptions');
            circleOptions.fillColor = color;
            oCom.options.drawingManager.set('circleOptions', circleOptions);

            var polygonOptions = oCom.options.drawingManager.get('polygonOptions');
            polygonOptions.fillColor = color;
            oCom.options.drawingManager.set('polygonOptions', polygonOptions);
        },
        /**
         * 取得目前所有shape
         * @returns {Array} array of Google Map MVCObject, will be Marker|Polyline|Polygon
         */
        _getShapeArr: function() {
            var oCom = this;
            return oCom.options.shapePool;
        },
        /**
         * 設定繪圖模式，參數可為"null", "marker", "polyline", "polygon", "circle", "rectangle"
         * @param {[type]} mode [description]
         */
        _setDrawingMode: function(mode) {
            var oCom = this;
            oCom.target
                .find('span[data-drawmode=' + mode + ']')
                .children('img')
                .each(function(){
                    /*
                    var imgsrc = $(this).attr('src');
                    if(!imgsrc.includes("_active")){
                        $(this).attr('src', imgsrc.replace(".png", "_active.png"));
                    }
                    */
                    $(this).toggleClass('active inactive');

                    var targetMode = mode == undefined ? "null" : mode;
                    var targetBtn = oCom.options.btnArr.find(function(ele){
                        return ele.mode == targetMode;
                    });
                    $(this).attr('src', targetBtn.icon.active);
                })
                .end()
                .siblings()
                .children('img')
                .each(function(){
                    /*
                    var imgsrc = $(this).attr('src');
                    $(this).attr('src', imgsrc.replace("_active", ""));
                    */
                    $(this).removeClass('active');
                    $(this).addClass('inactive');
                    var targetMode = $(this).closest('span').data().drawmode == undefined ? "null" : $(this).closest('span').data().drawmode;
                    var targetBtn = oCom.options.btnArr.find(function(ele){
                        return ele.mode == targetMode;
                    });
                    $(this).attr('src', targetBtn.icon.inactive);
                });

                switch (mode) {
                    case "null":
                        oCom.options.drawingManager.setDrawingMode(null);
                        break;
                    case "delete":
                        try {
                            oCom._deleteSelectedShape(oCom._getSelection());
                        } catch (ex) {

                        } finally {
                            setTimeout(function() {
                                oCom._setDrawingMode("null");
                            }, 200);
                        }
                        break;
                    default:
                        oCom.options.drawingManager.setDrawingMode(mode);
                        break;
                }
        },
        /**
         * 取得目前所有shape的GeoJSON
         * @returns {Object} FeatureCollection
         */
        _getGeoJsonData: function() {
            var oCom = this;

            var shadowDataLayer = new google.maps.Data();
            shadowDataLayer.setStyle({
                visible: false
            });
            shadowDataLayer.setMap(oCom.options.targetMap);

            oCom.options.shapePool.forEach(function(obj) {
                if (obj != undefined) {
                    switch (obj.type) {
                        case google.maps.drawing.OverlayType.MARKER:
                            shadowDataLayer.add(new google.maps.Data.Feature({
                                geometry: new google.maps.Data.Point(obj.shape.getPosition())
                            }));
                            break;
                        case google.maps.drawing.OverlayType.RECTANGLE:
                            var b = obj.shape.getBounds();
                            var p = [b.getSouthWest(), {
                                    lat: b.getSouthWest().lat(),
                                    lng: b.getNorthEast().lng()
                                }, b.getNorthEast(), {
                                    lng: b.getSouthWest().lng(),
                                    lat: b.getNorthEast().lat()
                                }];
                            shadowDataLayer.add(new google.maps.Data.Feature({
                                geometry: new google.maps.Data.Polygon([p])
                            }));
                            break;
                        case google.maps.drawing.OverlayType.POLYGON:
                            shadowDataLayer.add(new google.maps.Data.Feature({
                                geometry: new google.maps.Data.Polygon([obj.shape.getPath().getArray()])
                            }));
                            break;
                        case google.maps.drawing.OverlayType.POLYLINE:
                            shadowDataLayer.add(new google.maps.Data.Feature({
                                geometry: new google.maps.Data.LineString(obj.shape.getPath().getArray())
                            }));
                            break;
                        case google.maps.drawing.OverlayType.CIRCLE:
                            shadowDataLayer.add(new google.maps.Data.Feature({
                                properties: {
                                    radius: obj.shape.getRadius()
                                },
                                geometry: new google.maps.Data.Point(obj.shape.getCenter())
                            }));
                            break;
                    }
                }
            });

            var result = oCom.options.targetMap.getGeoJson(shadowDataLayer);
            return result;
        },
        /**
         * 將FeatureCollection新增到圖面上
         * @param {Object} FeatureCollection
         */
        _addGeoJsonData: function(featureCollection) {
            var oCom = this;
            var featureCollectionArray = [];
            featureCollection.features.forEach(function(feature) {
                switch (feature.geometry.type.toLowerCase()) {
                    case "point":
                        var myLatLng = {
                            lat: feature.geometry.coordinates[1],
                            lng: feature.geometry.coordinates[0]
                        };
                        var obj;
                        if (feature.properties.radius == undefined) {
                            //點
                            obj = new google.maps.Marker();
                            obj.setOptions(oCom.options.markerOptions);
                            obj.setPosition(myLatLng);
                            obj.setIcon(oCom.options.markerIcon.default);
                            obj.type = "marker";
                            obj.id = oCom.options.shapePool.length;
                            featureCollectionArray.push({
                                shape: obj,
                                type: google.maps.drawing.OverlayType.MARKER,
                                id: oCom.options.shapePool.length
                            });
                        } else {
                            //圓
                            obj = new google.maps.Circle();
                            obj.setCenter(myLatLng);
                            obj.setRadius(feature.properties.radius);
                            obj.setOptions(oCom.options.polygonOptions);
                            obj.type = "circle";
                            obj.id = oCom.options.shapePool.length;
                            featureCollectionArray.push({
                                shape: obj,
                                type: google.maps.drawing.OverlayType.CIRCLE,
                                id: oCom.options.shapePool.length
                            });
                        }


                        break;
                    case "polygon": //矩形， 多邊形
                        var polygonArr = [];
                        feature.geometry.coordinates.forEach(function(f) {
                            var ringArr = [];
                            f.forEach(function(p) {
                                var lat = p[1];
                                var lng = p[0];
                                ringArr.push({
                                    lat: lat,
                                    lng: lng
                                });
                            })
                            polygonArr.push(ringArr);
                        });
                        var obj = new google.maps.Polygon();
                        obj.setOptions(oCom.options.polygonOptions);
                        obj.setPaths(polygonArr);
                        obj.type = "polygon";
                        obj.id = oCom.options.shapePool.length;
                        featureCollectionArray.push({
                            shape: obj,
                            type: google.maps.drawing.OverlayType.POLYGON,
                            id: oCom.options.shapePool.length
                        });

                        break;
                    case "linestring": //線段
                        var polylineArr = [];
                        feature.geometry.coordinates.forEach(function(p) {
                            var lat = p[1];
                            var lng = p[0];
                            polylineArr.push({
                                lat: lat,
                                lng: lng
                            });
                        });

                        var obj = new google.maps.Polyline();
                        obj.setOptions(oCom.options.polylineOptions);
                        obj.setPath(polylineArr);
                        obj.type = "linestring";
                        obj.id = oCom.options.shapePool.length;
                        featureCollectionArray.push({
                            shape: obj,
                            type: google.maps.drawing.OverlayType.POLYLINE,
                            id: oCom.options.shapePool.length
                        });

                        break;
                }
            });
            featureCollectionArray.forEach(function(ele) {
                ele.shape.setMap(oCom.options.targetMap);
                if(!readonly)
                {
                    google.maps.event.addListener(ele.shape, 'click', function(e) {
                        oCom._setSelection(ele.shape);
                    });
                }
                oCom.options.shapePool.push(ele);
            });


        },
        /**
         * 取得綁定的地圖物件
         * @returns {Object} google.maps.Map
         */
        _getTargetMap: function() {
            var oCom = this;
            return oCom.options.targetMap;
        },
        /**
         * 取得繪圖元件類別
         * @returns {Object} google.maps.drawing.DrawingManager
         */
        _getInstance: function() {
            var oCom = this;
            return oCom.options.drawingManager;
        },

        /**
         * 取消事件註冊
         */
        _unsubscribeEvents: function () {
            this.target.off('onInitComplete');
        },
        /**
         * 綁定事件註冊
         */
        _subscribeEvents: function () {
            //先解除所有事件接口
            this._unsubscribeEvents();

            //綁定初始化完成事件接口
            if (typeof (this.options.onInitComplete) === 'function') {
                this.target.on('onInitComplete', this.options.onInitComplete);
            }
        }
    }

    //公開方法
    $.fn[pluginName] = function(options, args) {
        var drawingManager;
        this.each(function() {
            drawingManager = new DrawingManager($(this), options);
        });

        this.getInstance = function(){
            return drawingManager._getInstance();
        }
        this.getTargetMap = function(){
            return drawingManager._getTargetMap();
        }
        this.getGeoJsonData = function(){
            return drawingManager._getGeoJsonData();
        }
        this.addGeoJsonData = function(featureCollection){
            return drawingManager._addGeoJsonData(featureCollection);
        }
        this.setDrawingMode = function(mode){
            drawingManager._setDrawingMode(mode);
        }
        this.clear = function(){
            drawingManager._clear();
        }
        return this;
    }

})(jQuery, window, document);

