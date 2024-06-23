import {Construct} from "constructs";
import {App, TerraformStack, TerraformOutput} from "cdktf";
import {readFileSync} from 'fs';
import * as path from 'path';
import {AwsProvider} from '@cdktf/provider-aws/lib/provider';
import {KeyPair} from '@cdktf/provider-aws/lib/key-pair';
import {SecurityModule} from './modules/securities';
import {ComputeModule} from './modules/compute';
import {NetworkModule} from './modules/network';

class MyStack extends TerraformStack {
	private readonly region = "ap-southeast-3";
	private readonly instanceType = "t3.micro"
	private readonly availabilityZone_1 = "ap-southeast-1a"
	private readonly availabilityZone_2 = "ap-southeast-1b"
	private readonly cidrBlock = "10.0.0.0/16"
	private readonly publicSubnetIps = [ "10.0.1.0/24", "10.0.2.0/24" ]
	private readonly privateSubnetIps = [ "10.0.10.0/24", "10.0.20.0/24" ]
	private readonly keypairName = "id_ed25519"
	private readonly amis = {
		"ap-southeast-3": {
			value: "ami-006e9f3b56e49ce63"
		},
		"ap-southeast-1": {
			value: "ami-04c913012f8977029"
		}
	}
	constructor(scope: Construct, id: string) {
		super(scope, id);
		
		new AwsProvider(this, "AWS", {
			region: this.region,
		});
		
		// Tạo Key Pair
		const keyPair = new KeyPair(this, 'kot-keypair', {
			keyName: this.keypairName,
			publicKey: readFileSync(path.resolve(`./keypair/${this.keypairName}.pub`)).toString()
		});
		
		// Tạo Networking Id
		const networking = new NetworkModule(this, "networking", {
			region: this.region,
			availabilityZone1: this.availabilityZone_1,
			availabilityZone2: this.availabilityZone_2,
			cidrBlock: this.cidrBlock,
			publicSubnetIps: this.publicSubnetIps,
			privateSubnetIps: this.privateSubnetIps,
		})
		
		// Tạo Security Group
		const securityGroup = new SecurityModule(this, 'security', networking.myVpc.id);
		
		const ec2Instance = new ComputeModule(this, 'compute', {
			region: this.region,
			imageId: this.amis[this.region].value,
			keyName: keyPair.keyName,
			instanceType: this.instanceType,
			ec2SecurityGroupIds: [securityGroup.publicSecurityGroupId]
		});
		
		new TerraformOutput(this, "private_security_group_id", {
			value: securityGroup.privateSecurityGroupId,
		});
		
		new TerraformOutput(this, "public_security_group_id", {
			value: securityGroup.publicSecurityGroupId,
		});
		
		new TerraformOutput(this, "public_ip", {
			value: ec2Instance.demoInstance.publicIp,
		});
	}
}

const app = new App();
new MyStack(app, "iac-typescript-terraform-aws");
app.synth();
