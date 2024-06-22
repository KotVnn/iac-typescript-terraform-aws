import {Construct} from "constructs";
import {App, TerraformStack, TerraformOutput} from "cdktf";
import {readFileSync} from 'fs';
import * as path from 'path';
import {AwsProvider} from '@cdktf/provider-aws/lib/provider';
import {KeyPair} from '@cdktf/provider-aws/lib/key-pair';
import {SecurityGroup} from '@cdktf/provider-aws/lib/security-group';
import {Instance} from '@cdktf/provider-aws/lib/instance';

class MyStack extends TerraformStack {
	constructor(scope: Construct, id: string) {
		super(scope, id);
		
		new AwsProvider(this, "AWS", {
			region: "ap-southeast-3",
		});
		
		// Tạo Key Pair
		const keyPair = new KeyPair(this, 'kot-keypair', {
			keyName: 'id_ed25519',
			publicKey: readFileSync(path.resolve('./keypair/id_ed25519.pub')).toString()
		});
		
		// Tạo Security Group
		const securityGroup = new SecurityGroup(this, 'test-security-group', {
			name: 'test-security-group',
			description: 'test-security-group',
			ingress: [
				{
					fromPort: 443,
					toPort: 443,
					protocol: 'tcp',
					cidrBlocks: ['0.0.0.0/0']
				},
				{
					fromPort: 80,
					toPort: 80,
					protocol: 'tcp',
					cidrBlocks: ['0.0.0.0/0']
				},
				{
					fromPort: 22,
					toPort: 22,
					protocol: 'tcp',
					cidrBlocks: ['0.0.0.0/0']
				}
			],
			egress: [
				{
					fromPort: 0,
					toPort: 0,
					protocol: '-1',
					cidrBlocks: ['0.0.0.0/0']
				}
			]
		});
		
		const ec2Instance = new Instance(this, "compute", {
			ami: "ami-006e9f3b56e49ce63",
			instanceType: "t3.micro",
			keyName: keyPair.keyName,
			tags: {
				Name: "AHT Kot Demo"
			},
			vpcSecurityGroupIds: [securityGroup.id]
		});
		
		new TerraformOutput(this, "public_ip", {
			value: ec2Instance.publicIp,
		});
	}
}

const app = new App();
new MyStack(app, "iac-typescript-terraform-aws");
app.synth();
