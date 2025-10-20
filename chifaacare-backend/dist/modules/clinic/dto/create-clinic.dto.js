"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClinicDto = void 0;
const class_validator_1 = require("class-validator");
let CreateClinicDto = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _address_decorators;
    let _address_initializers = [];
    let _address_extraInitializers = [];
    let _city_decorators;
    let _city_initializers = [];
    let _city_extraInitializers = [];
    let _state_decorators;
    let _state_initializers = [];
    let _state_extraInitializers = [];
    let _country_decorators;
    let _country_initializers = [];
    let _country_extraInitializers = [];
    let _postalCode_decorators;
    let _postalCode_initializers = [];
    let _postalCode_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _website_decorators;
    let _website_initializers = [];
    let _website_extraInitializers = [];
    let _taxId_decorators;
    let _taxId_initializers = [];
    let _taxId_extraInitializers = [];
    let _billingEmail_decorators;
    let _billingEmail_initializers = [];
    let _billingEmail_extraInitializers = [];
    let _billingAddress_decorators;
    let _billingAddress_initializers = [];
    let _billingAddress_extraInitializers = [];
    let _billingCity_decorators;
    let _billingCity_initializers = [];
    let _billingCity_extraInitializers = [];
    let _billingCountry_decorators;
    let _billingCountry_initializers = [];
    let _billingCountry_extraInitializers = [];
    let _billingPostalCode_decorators;
    let _billingPostalCode_initializers = [];
    let _billingPostalCode_extraInitializers = [];
    return _a = class CreateClinicDto {
            constructor() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.address = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _address_initializers, void 0));
                this.city = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _city_initializers, void 0));
                this.state = (__runInitializers(this, _city_extraInitializers), __runInitializers(this, _state_initializers, void 0));
                this.country = (__runInitializers(this, _state_extraInitializers), __runInitializers(this, _country_initializers, void 0));
                this.postalCode = (__runInitializers(this, _country_extraInitializers), __runInitializers(this, _postalCode_initializers, void 0));
                this.phone = (__runInitializers(this, _postalCode_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.email = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _email_initializers, void 0));
                this.website = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _website_initializers, void 0));
                this.taxId = (__runInitializers(this, _website_extraInitializers), __runInitializers(this, _taxId_initializers, void 0));
                this.billingEmail = (__runInitializers(this, _taxId_extraInitializers), __runInitializers(this, _billingEmail_initializers, void 0));
                this.billingAddress = (__runInitializers(this, _billingEmail_extraInitializers), __runInitializers(this, _billingAddress_initializers, void 0));
                this.billingCity = (__runInitializers(this, _billingAddress_extraInitializers), __runInitializers(this, _billingCity_initializers, void 0));
                this.billingCountry = (__runInitializers(this, _billingCity_extraInitializers), __runInitializers(this, _billingCountry_initializers, void 0));
                this.billingPostalCode = (__runInitializers(this, _billingCountry_extraInitializers), __runInitializers(this, _billingPostalCode_initializers, void 0));
                __runInitializers(this, _billingPostalCode_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _address_decorators = [(0, class_validator_1.IsString)()];
            _city_decorators = [(0, class_validator_1.IsString)()];
            _state_decorators = [(0, class_validator_1.IsString)()];
            _country_decorators = [(0, class_validator_1.IsString)()];
            _postalCode_decorators = [(0, class_validator_1.IsString)()];
            _phone_decorators = [(0, class_validator_1.IsString)()];
            _email_decorators = [(0, class_validator_1.IsEmail)()];
            _website_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _taxId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _billingEmail_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _billingAddress_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _billingCity_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _billingCountry_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _billingPostalCode_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: obj => "address" in obj, get: obj => obj.address, set: (obj, value) => { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
            __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: obj => "city" in obj, get: obj => obj.city, set: (obj, value) => { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
            __esDecorate(null, null, _state_decorators, { kind: "field", name: "state", static: false, private: false, access: { has: obj => "state" in obj, get: obj => obj.state, set: (obj, value) => { obj.state = value; } }, metadata: _metadata }, _state_initializers, _state_extraInitializers);
            __esDecorate(null, null, _country_decorators, { kind: "field", name: "country", static: false, private: false, access: { has: obj => "country" in obj, get: obj => obj.country, set: (obj, value) => { obj.country = value; } }, metadata: _metadata }, _country_initializers, _country_extraInitializers);
            __esDecorate(null, null, _postalCode_decorators, { kind: "field", name: "postalCode", static: false, private: false, access: { has: obj => "postalCode" in obj, get: obj => obj.postalCode, set: (obj, value) => { obj.postalCode = value; } }, metadata: _metadata }, _postalCode_initializers, _postalCode_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _website_decorators, { kind: "field", name: "website", static: false, private: false, access: { has: obj => "website" in obj, get: obj => obj.website, set: (obj, value) => { obj.website = value; } }, metadata: _metadata }, _website_initializers, _website_extraInitializers);
            __esDecorate(null, null, _taxId_decorators, { kind: "field", name: "taxId", static: false, private: false, access: { has: obj => "taxId" in obj, get: obj => obj.taxId, set: (obj, value) => { obj.taxId = value; } }, metadata: _metadata }, _taxId_initializers, _taxId_extraInitializers);
            __esDecorate(null, null, _billingEmail_decorators, { kind: "field", name: "billingEmail", static: false, private: false, access: { has: obj => "billingEmail" in obj, get: obj => obj.billingEmail, set: (obj, value) => { obj.billingEmail = value; } }, metadata: _metadata }, _billingEmail_initializers, _billingEmail_extraInitializers);
            __esDecorate(null, null, _billingAddress_decorators, { kind: "field", name: "billingAddress", static: false, private: false, access: { has: obj => "billingAddress" in obj, get: obj => obj.billingAddress, set: (obj, value) => { obj.billingAddress = value; } }, metadata: _metadata }, _billingAddress_initializers, _billingAddress_extraInitializers);
            __esDecorate(null, null, _billingCity_decorators, { kind: "field", name: "billingCity", static: false, private: false, access: { has: obj => "billingCity" in obj, get: obj => obj.billingCity, set: (obj, value) => { obj.billingCity = value; } }, metadata: _metadata }, _billingCity_initializers, _billingCity_extraInitializers);
            __esDecorate(null, null, _billingCountry_decorators, { kind: "field", name: "billingCountry", static: false, private: false, access: { has: obj => "billingCountry" in obj, get: obj => obj.billingCountry, set: (obj, value) => { obj.billingCountry = value; } }, metadata: _metadata }, _billingCountry_initializers, _billingCountry_extraInitializers);
            __esDecorate(null, null, _billingPostalCode_decorators, { kind: "field", name: "billingPostalCode", static: false, private: false, access: { has: obj => "billingPostalCode" in obj, get: obj => obj.billingPostalCode, set: (obj, value) => { obj.billingPostalCode = value; } }, metadata: _metadata }, _billingPostalCode_initializers, _billingPostalCode_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateClinicDto = CreateClinicDto;
