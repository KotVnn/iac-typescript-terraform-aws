import {Construct} from "constructs";
import {App, TerraformStack} from "cdktf";
import {AwsProvider} from '@cdktf/provider-aws/lib/provider';
import {NetworkModule} from './modules/network';
import {Variables} from './variables';

class MyStack extends TerraformStack {
	
	constructor(scope: Construct, id: string) {
		super(scope, id);
		
		const provider = new AwsProvider(this, "AWS", {
			region: Variables.region,
		});
		
		// Tạo Networking Id
		new NetworkModule(this, "networking", provider)
	}
}

const app = new App();
new MyStack(app, "iac-typescript-terraform-aws");
app.synth();
