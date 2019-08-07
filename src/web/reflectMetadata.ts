import "reflect-metadata"

/*
Здесь мы создаём новую функциою Reflect.asFactory(), которая добавляет поддержку ленивых метаданных
Работает вместе с babel-палгином babel-plugin-typescript-lazy-metadata
 */

declare global {
    namespace Reflect {
        function asFactory(factory: () => any): any;
    }
}
Reflect.asFactory = (factory) => Object.assign(factory, {__lazyFactory: true})
const originalReflectGetMetadata = Reflect.getMetadata
Reflect.getMetadata = (...args: any[]) => {
    let result = originalReflectGetMetadata.apply(Reflect, args)
    if (typeof result === "function" && result.length === 0 && result.__lazyFactory === true) {
        result = result()
    }
    return result
}
